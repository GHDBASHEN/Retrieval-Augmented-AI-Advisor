pipeline {
    agent any

    environment {
        // You will configure these in Jenkins Credentials later
        PINECONE_API_KEY = credentials('pinecone-api-key')
        GROQ_API_KEY = credentials('groq-api-key')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build & Deploy Containers') {
            steps {
                script {
                    // Stop existing containers and clean up
                    sh 'docker-compose down'
                    
                    // Build and start the containers in detached mode
                    sh 'docker-compose up -d --build'
                }
            }
        }
        
        stage('Initialize Database') {
            steps {
                script {
                    // Run the database initialization script inside the backend container
                    sh 'docker-compose exec -T backend python init_db.py'
                }
            }
        }
    }
    
    post {
        always {
            // Clean up unused docker images to save Azure VM disk space
            sh 'docker image prune -f'
        }
    }
}