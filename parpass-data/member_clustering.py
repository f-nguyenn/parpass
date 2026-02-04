"""
Member Clustering Model for ParPass
====================================
Segments members into behavioral clusters for targeted recommendations and marketing.

Cluster Types:
- Ambitious Improver: Actively trying to get better, plays frequently
- Casual Player: Plays occasionally for fun/social, less focused on improvement
- Course Explorer: Loves trying new courses, variety-seeker
- Budget Conscious: Prioritizes value, prefers affordable options
- Premium Seeker: Values quality, willing to pay for best experience
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import pickle
import matplotlib.pyplot as plt

# Connect to database
engine = create_engine('postgresql://localhost/parpass')


def load_member_features():
    """Load and prepare member features for clustering"""

    # Load member preferences with skill data
    members_df = pd.read_sql("""
        SELECT
            m.id as member_id,
            m.first_name,
            m.last_name,
            pt.name as tier,
            mp.skill_level,
            mp.handicap,
            mp.years_playing,
            mp.age_range,
            mp.play_frequency,
            mp.preferred_time,
            mp.budget_preference,
            mp.preferred_difficulty,
            mp.prefers_walking,
            mp.plays_solo,
            mp.max_travel_miles,
            mp.goals
        FROM members m
        JOIN health_plans hp ON m.health_plan_id = hp.id
        JOIN plan_tiers pt ON hp.plan_tier_id = pt.id
        LEFT JOIN member_preferences mp ON m.id = mp.member_id
        WHERE m.status = 'active'
    """, engine)

    # Load utilization stats per member
    utilization_df = pd.read_sql("""
        SELECT
            member_id,
            COUNT(*) as total_rounds,
            COUNT(DISTINCT course_id) as unique_courses,
            AVG(holes_played) as avg_holes,
            MAX(checked_in_at) as last_played
        FROM golf_utilization
        GROUP BY member_id
    """, engine)

    # Load course preferences (what difficulty they actually play)
    course_prefs_df = pd.read_sql("""
        SELECT
            gu.member_id,
            AVG(CASE gc.difficulty
                WHEN 'easy' THEN 1
                WHEN 'moderate' THEN 2
                WHEN 'challenging' THEN 3
                WHEN 'expert' THEN 4
                ELSE 2 END) as avg_difficulty_played,
            AVG(CASE gc.price_range
                WHEN 'budget' THEN 1
                WHEN 'moderate' THEN 2
                WHEN 'premium' THEN 3
                WHEN 'luxury' THEN 4
                ELSE 2 END) as avg_price_played
        FROM golf_utilization gu
        JOIN golf_courses gc ON gu.course_id = gc.id
        GROUP BY gu.member_id
    """, engine)

    # Merge all data
    df = members_df.merge(utilization_df, on='member_id', how='left')
    df = df.merge(course_prefs_df, on='member_id', how='left')

    # Fill missing values
    df['total_rounds'] = df['total_rounds'].fillna(0)
    df['unique_courses'] = df['unique_courses'].fillna(0)
    df['avg_holes'] = df['avg_holes'].fillna(18)
    df['avg_difficulty_played'] = df['avg_difficulty_played'].fillna(2)
    df['avg_price_played'] = df['avg_price_played'].fillna(2)

    return df


def engineer_features(df):
    """Create features for clustering"""

    features = pd.DataFrame()
    features['member_id'] = df['member_id']

    # Skill level (numeric)
    skill_map = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
    features['skill_numeric'] = df['skill_level'].map(skill_map).fillna(2)

    # Handicap (lower = better)
    features['handicap'] = df['handicap'].fillna(20)

    # Experience
    features['years_playing'] = df['years_playing'].fillna(5)

    # Play frequency (numeric)
    freq_map = {'weekly': 4, 'biweekly': 3, 'monthly': 2, 'occasionally': 1}
    features['play_frequency_numeric'] = df['play_frequency'].map(freq_map).fillna(2)

    # Budget preference (numeric)
    budget_map = {'budget': 1, 'moderate': 2, 'premium': 3, 'any': 2.5}
    features['budget_numeric'] = df['budget_preference'].map(budget_map).fillna(2)

    # Difficulty preference (numeric)
    diff_map = {'easy': 1, 'moderate': 2, 'challenging': 3, 'any': 2}
    features['difficulty_pref_numeric'] = df['preferred_difficulty'].map(diff_map).fillna(2)

    # Behavioral features
    features['total_rounds'] = df['total_rounds']
    features['unique_courses'] = df['unique_courses']
    features['course_variety_ratio'] = (df['unique_courses'] / df['total_rounds'].replace(0, 1)).fillna(0)

    # Actual play patterns
    features['avg_difficulty_played'] = df['avg_difficulty_played']
    features['avg_price_played'] = df['avg_price_played']

    # Travel willingness
    features['max_travel_miles'] = df['max_travel_miles'].fillna(30)

    # Social preferences
    features['plays_solo'] = df['plays_solo'].fillna(False).astype(int)
    features['prefers_walking'] = df['prefers_walking'].fillna(False).astype(int)

    # Goal-based features (from goals array)
    features['goal_improve'] = df['goals'].apply(
        lambda x: 1 if x and ('improve_skills' in x or 'learn_game' in x) else 0
    )
    features['goal_social'] = df['goals'].apply(
        lambda x: 1 if x and ('meet_people' in x) else 0
    )
    features['goal_compete'] = df['goals'].apply(
        lambda x: 1 if x and ('play_competitively' in x) else 0
    )
    features['goal_explore'] = df['goals'].apply(
        lambda x: 1 if x and ('play_new_courses' in x) else 0
    )
    features['goal_relax'] = df['goals'].apply(
        lambda x: 1 if x and ('relax' in x or 'exercise' in x) else 0
    )

    return features


def build_clusters(features_df, n_clusters=5):
    """Build K-means clustering model"""

    # Select numeric features for clustering
    feature_cols = [
        'skill_numeric', 'handicap', 'years_playing',
        'play_frequency_numeric', 'budget_numeric', 'difficulty_pref_numeric',
        'total_rounds', 'unique_courses', 'course_variety_ratio',
        'avg_difficulty_played', 'avg_price_played', 'max_travel_miles',
        'plays_solo', 'prefers_walking',
        'goal_improve', 'goal_social', 'goal_compete', 'goal_explore', 'goal_relax'
    ]

    X = features_df[feature_cols].values

    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Fit K-means
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)

    # Add cluster labels to features
    features_df = features_df.copy()
    features_df['cluster'] = clusters

    return features_df, kmeans, scaler, feature_cols


def label_clusters(features_df, kmeans):
    """Assign meaningful names to clusters based on centroids"""

    # Analyze cluster centroids to assign names
    cluster_profiles = features_df.groupby('cluster').agg({
        'skill_numeric': 'mean',
        'handicap': 'mean',
        'play_frequency_numeric': 'mean',
        'budget_numeric': 'mean',
        'total_rounds': 'mean',
        'unique_courses': 'mean',
        'course_variety_ratio': 'mean',
        'goal_improve': 'mean',
        'goal_compete': 'mean',
        'goal_explore': 'mean',
        'goal_relax': 'mean',
        'goal_social': 'mean'
    }).round(2)

    print("\n=== Cluster Profiles ===\n")
    print(cluster_profiles.to_string())

    # Auto-label based on dominant characteristics
    cluster_names = {}
    for cluster_id in cluster_profiles.index:
        profile = cluster_profiles.loc[cluster_id]

        # Determine cluster type based on profile
        if profile['goal_improve'] > 0.5 and profile['play_frequency_numeric'] > 2.5:
            name = "Ambitious Improver"
        elif profile['goal_explore'] > 0.5 or profile['course_variety_ratio'] > 0.7:
            name = "Course Explorer"
        elif profile['budget_numeric'] < 1.8:
            name = "Budget Conscious"
        elif profile['budget_numeric'] > 2.5 and profile['skill_numeric'] > 2:
            name = "Premium Seeker"
        elif profile['goal_relax'] > 0.5 or profile['goal_social'] > 0.5:
            name = "Casual Player"
        elif profile['goal_compete'] > 0.5:
            name = "Competitive Player"
        else:
            name = f"Segment {cluster_id}"

        cluster_names[cluster_id] = name

    features_df['cluster_name'] = features_df['cluster'].map(cluster_names)

    return features_df, cluster_names, cluster_profiles


def save_model(kmeans, scaler, feature_cols, cluster_names):
    """Save the clustering model"""

    model_data = {
        'kmeans': kmeans,
        'scaler': scaler,
        'feature_cols': feature_cols,
        'cluster_names': cluster_names
    }

    with open('member_clustering_model.pkl', 'wb') as f:
        pickle.dump(model_data, f)

    print("\nModel saved to member_clustering_model.pkl")


def update_database_clusters(features_df, engine):
    """Update cluster assignments in database"""

    from sqlalchemy import text

    with engine.connect() as conn:
        for _, row in features_df.iterrows():
            conn.execute(text("""
                UPDATE member_preferences
                SET cluster_id = :cluster, cluster_updated_at = NOW()
                WHERE member_id = :member_id
            """), {'cluster': int(row['cluster']), 'member_id': str(row['member_id'])})
        conn.commit()

    print(f"\nUpdated {len(features_df)} member cluster assignments in database")


def visualize_clusters(features_df, feature_cols):
    """Create visualization of clusters"""

    # Use PCA to reduce to 2D for visualization
    X = features_df[feature_cols].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    pca = PCA(n_components=2)
    X_2d = pca.fit_transform(X_scaled)

    # Plot
    fig, ax = plt.subplots(figsize=(12, 8))

    scatter = ax.scatter(
        X_2d[:, 0], X_2d[:, 1],
        c=features_df['cluster'],
        cmap='viridis',
        s=100,
        alpha=0.7
    )

    # Add member names as labels
    for i, row in features_df.iterrows():
        ax.annotate(
            row.get('first_name', f"M{i}"),
            (X_2d[i, 0], X_2d[i, 1]),
            fontsize=9,
            alpha=0.8
        )

    ax.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)')
    ax.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)')
    ax.set_title('Member Clusters (PCA Visualization)', fontsize=14, fontweight='bold')

    # Add legend
    handles, labels = scatter.legend_elements()
    cluster_labels = [features_df[features_df['cluster'] == i]['cluster_name'].iloc[0]
                      for i in range(len(handles))]
    ax.legend(handles, cluster_labels, title="Clusters", loc='upper right')

    plt.tight_layout()
    plt.savefig('member_clusters_visualization.png', dpi=150)
    plt.show()

    print("\nVisualization saved to member_clusters_visualization.png")


def predict_cluster(member_data, model_path='member_clustering_model.pkl'):
    """Predict cluster for a new member"""

    with open(model_path, 'rb') as f:
        model = pickle.load(f)

    # Prepare features in same order as training
    X = np.array([[member_data.get(col, 0) for col in model['feature_cols']]])
    X_scaled = model['scaler'].transform(X)

    cluster = model['kmeans'].predict(X_scaled)[0]
    cluster_name = model['cluster_names'].get(cluster, f"Segment {cluster}")

    return cluster, cluster_name


def main():
    """Run the full clustering pipeline"""

    print("=" * 60)
    print("ParPass Member Clustering Model")
    print("=" * 60)

    # Load data
    print("\n1. Loading member data...")
    raw_df = load_member_features()
    print(f"   Loaded {len(raw_df)} members")

    # Engineer features
    print("\n2. Engineering features...")
    features_df = engineer_features(raw_df)

    # Merge names for display
    features_df = features_df.merge(
        raw_df[['member_id', 'first_name', 'last_name']],
        on='member_id'
    )

    print(f"   Created {len(features_df.columns) - 3} features")

    # Determine optimal number of clusters (use 4 for small dataset)
    n_clusters = min(4, len(features_df) - 1)

    # Build clusters
    print(f"\n3. Building {n_clusters} clusters...")
    features_df, kmeans, scaler, feature_cols = build_clusters(features_df, n_clusters)

    # Label clusters
    print("\n4. Labeling clusters...")
    features_df, cluster_names, cluster_profiles = label_clusters(features_df, kmeans)

    # Print member assignments
    print("\n=== Member Cluster Assignments ===\n")
    for cluster_name in features_df['cluster_name'].unique():
        members = features_df[features_df['cluster_name'] == cluster_name]
        print(f"{cluster_name}:")
        for _, m in members.iterrows():
            print(f"  - {m['first_name']} {m['last_name']}")
        print()

    # Save model
    print("\n5. Saving model...")
    save_model(kmeans, scaler, feature_cols, cluster_names)

    # Update database
    print("\n6. Updating database...")
    update_database_clusters(features_df, engine)

    # Visualize
    print("\n7. Creating visualization...")
    visualize_clusters(features_df, feature_cols)

    print("\n" + "=" * 60)
    print("Clustering complete!")
    print("=" * 60)

    return features_df, kmeans, scaler, cluster_names


if __name__ == '__main__':
    features_df, kmeans, scaler, cluster_names = main()
