from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this-in-production'

# Data file paths
DATA_DIR = 'data'
SERVICES_FILE = os.path.join(DATA_DIR, 'services.json')
BLOGS_FILE = os.path.join(DATA_DIR, 'blogs.json')

# Create data directory if it doesn't exist
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize default data
DEFAULT_SERVICES = [
    {
        "id": 1,
        "icon": "🤖",
        "title": "Custom AI Chatbots",
        "description": "Intelligent conversational AI solutions designed specifically for your business needs. Enhance customer engagement and automate support with state-of-the-art chatbot technology."
    },
    {
        "id": 2,
        "icon": "⚡",
        "title": "AI Workflow Integration",
        "description": "Seamlessly integrate AI into your existing workflows. Boost productivity and efficiency by automating repetitive tasks and enhancing decision-making processes."
    },
    {
        "id": 3,
        "icon": "📈",
        "title": "Trading Setup Solutions",
        "description": "Custom stock market trading setups tailored for specific niches. Advanced algorithms and analytics to give you a competitive edge in the market."
    },
    {
        "id": 4,
        "icon": "🛒",
        "title": "E-commerce Websites",
        "description": "Full-featured online stores designed to convert visitors into customers. Responsive, secure, and optimized for maximum sales performance."
    },
    {
        "id": 5,
        "icon": "💻",
        "title": "Desktop Applications",
        "description": "Powerful desktop software solutions for Windows, Mac, and Linux. Built with performance, security, and user experience in mind."
    },
    {
        "id": 6,
        "icon": "🌐",
        "title": "Web-Based Solutions",
        "description": "Modern, scalable web applications that work seamlessly across all devices. From enterprise systems to consumer platforms, we build it all."
    }
]

DEFAULT_BLOGS = [
    {
        "id": 1,
        "title": "The Future of AI in Business",
        "excerpt": "Exploring how artificial intelligence is transforming modern enterprises and creating new opportunities for growth.",
        "author": "Tech Team",
        "date": "2024-03-15",
        "image": "🤖",
        "starred": True
    },
    {
        "id": 2,
        "title": "Building Scalable Web Applications",
        "excerpt": "Best practices and architectural patterns for creating web applications that can handle millions of users.",
        "author": "Dev Team",
        "date": "2024-03-10",
        "image": "🌐",
        "starred": True
    },
    {
        "id": 3,
        "title": "E-commerce Trends 2024",
        "excerpt": "The latest trends shaping online retail and how businesses can stay ahead of the competition.",
        "author": "Marketing Team",
        "date": "2024-03-05",
        "image": "🛒",
        "starred": True
    }
]

# Helper functions
def load_json(filename, default_data):
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    else:
        save_json(filename, default_data)
        return default_data

def save_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def get_services():
    return load_json(SERVICES_FILE, DEFAULT_SERVICES)

def get_blogs():
    return load_json(BLOGS_FILE, DEFAULT_BLOGS)

# Routes
@app.route('/')
def index():
    services = get_services()
    blogs = get_blogs()
    # Only show starred blogs on home page
    starred_blogs = [blog for blog in blogs if blog.get('starred', False)]
    return render_template('index.html', services=services, blogs=starred_blogs)

@app.route('/blogs')
def blogs_page():
    blogs = get_blogs()
    return render_template('blogs.html', blogs=blogs)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        password = request.form.get('password')
        if password == 'admin123':  # Change this password!
            session['admin'] = True
            return redirect(url_for('admin_panel'))
        else:
            return render_template('admin_login.html', error='Incorrect password')
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin', None)
    return redirect(url_for('index'))

@app.route('/admin/panel')
def admin_panel():
    if not session.get('admin'):
        return redirect(url_for('admin_login'))
    services = get_services()
    blogs = get_blogs()
    return render_template('admin_panel.html', services=services, blogs=blogs)

# API Routes for Services
@app.route('/api/services', methods=['GET'])
def api_get_services():
    return jsonify(get_services())

@app.route('/api/services', methods=['POST'])
def api_add_service():
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    services = get_services()
    new_service = request.json
    new_service['id'] = max([s['id'] for s in services], default=0) + 1
    services.append(new_service)
    save_json(SERVICES_FILE, services)
    return jsonify(new_service)

@app.route('/api/services/<int:service_id>', methods=['PUT'])
def api_update_service(service_id):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    services = get_services()
    updated_service = request.json
    for i, service in enumerate(services):
        if service['id'] == service_id:
            services[i] = {**updated_service, 'id': service_id}
            save_json(SERVICES_FILE, services)
            return jsonify(services[i])
    return jsonify({'error': 'Service not found'}), 404

@app.route('/api/services/<int:service_id>', methods=['DELETE'])
def api_delete_service(service_id):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    services = get_services()
    services = [s for s in services if s['id'] != service_id]
    save_json(SERVICES_FILE, services)
    return jsonify({'success': True})

# API Routes for Blogs
@app.route('/api/blogs', methods=['GET'])
def api_get_blogs():
    return jsonify(get_blogs())

@app.route('/api/blogs', methods=['POST'])
def api_add_blog():
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    blogs = get_blogs()
    new_blog = request.json
    new_blog['id'] = max([b['id'] for b in blogs], default=0) + 1
    # Default starred to False for new blogs
    if 'starred' not in new_blog:
        new_blog['starred'] = False
    blogs.append(new_blog)
    save_json(BLOGS_FILE, blogs)
    return jsonify(new_blog)

@app.route('/api/blogs/<int:blog_id>', methods=['PUT'])
def api_update_blog(blog_id):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    blogs = get_blogs()
    updated_blog = request.json
    for i, blog in enumerate(blogs):
        if blog['id'] == blog_id:
            # Preserve starred status if not provided in update
            if 'starred' not in updated_blog:
                updated_blog['starred'] = blog.get('starred', False)
            blogs[i] = {**updated_blog, 'id': blog_id}
            save_json(BLOGS_FILE, blogs)
            return jsonify(blogs[i])
    return jsonify({'error': 'Blog not found'}), 404

@app.route('/api/blogs/<int:blog_id>', methods=['DELETE'])
def api_delete_blog(blog_id):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    blogs = get_blogs()
    blogs = [b for b in blogs if b['id'] != blog_id]
    save_json(BLOGS_FILE, blogs)
    return jsonify({'success': True})

@app.route('/api/blogs/<int:blog_id>/star', methods=['PUT'])
def api_toggle_blog_star(blog_id):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    blogs = get_blogs()
    for i, blog in enumerate(blogs):
        if blog['id'] == blog_id:
            # Toggle starred status
            blogs[i]['starred'] = not blog.get('starred', False)
            save_json(BLOGS_FILE, blogs)
            return jsonify({'success': True, 'starred': blogs[i]['starred']})
    return jsonify({'error': 'Blog not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)