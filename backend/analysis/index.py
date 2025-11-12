import json
import os
from datetime import datetime
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import Json, RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Save and retrieve user analysis results with recommendations
    Args: event with httpMethod, body (POST: {userId, analysisType, score, answers, recommendations}), queryStringParameters (GET: userId, analysisType)
    Returns: HTTP response with analysis data or confirmation
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('userId', 1)
        analysis_type = body_data.get('analysisType')
        score = body_data.get('score')
        answers = body_data.get('answers', {})
        recommendations = body_data.get('recommendations', [])
        
        cursor.execute('''
            INSERT INTO users (id, last_active)
            VALUES (%s, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET last_active = CURRENT_TIMESTAMP
        ''', (user_id,))
        
        cursor.execute('''
            INSERT INTO analyses (user_id, analysis_type, score, answers, recommendations, created_at)
            VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING id, created_at
        ''', (user_id, analysis_type, score, Json(answers), recommendations))
        
        result = cursor.fetchone()
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'analysisId': result['id'],
                'createdAt': result['created_at'].isoformat()
            }),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = int(params.get('userId', 1))
        analysis_type = params.get('analysisType')
        
        if analysis_type:
            cursor.execute('''
                SELECT id, analysis_type, score, answers, recommendations, created_at
                FROM analyses
                WHERE user_id = %s AND analysis_type = %s
                ORDER BY created_at DESC
                LIMIT 10
            ''', (user_id, analysis_type))
        else:
            cursor.execute('''
                SELECT id, analysis_type, score, answers, recommendations, created_at
                FROM analyses
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT 50
            ''', (user_id,))
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        analyses = []
        for row in results:
            analyses.append({
                'id': row['id'],
                'analysisType': row['analysis_type'],
                'score': row['score'],
                'answers': row['answers'],
                'recommendations': row['recommendations'],
                'createdAt': row['created_at'].isoformat()
            })
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'analyses': analyses}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
