// ============= static/js/script.js =============
// Landing page scripts

// Create floating particles
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        hero.appendChild(particle);
    }
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
function toggleMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuToggle && mobileMenu) {
        if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    }
});

// Add parallax effect to hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / 500);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});


// ============= static/js/admin.js =============
// Admin panel scripts

let currentServiceId = null;
let currentBlogId = null;

// Service Modal Functions
function openServiceModal(service = null) {
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');
    
    if (service) {
        title.textContent = 'Edit Service';
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceIcon').value = service.icon;
        document.getElementById('serviceTitle').value = service.title;
        document.getElementById('serviceDescription').value = service.description;
        currentServiceId = service.id;
    } else {
        title.textContent = 'Add Service';
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceId').value = '';
        currentServiceId = null;
    }
    
    modal.classList.add('active');
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    modal.classList.remove('active');
    document.getElementById('serviceForm').reset();
    currentServiceId = null;
}

function editService(service) {
    openServiceModal(service);
}

async function deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/services/${serviceId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            location.reload();
        } else {
            alert('Error deleting service');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting service');
    }
}

// Blog Modal Functions
function openBlogModal(blog = null) {
    const modal = document.getElementById('blogModal');
    const title = document.getElementById('blogModalTitle');
    
    if (blog) {
        title.textContent = 'Edit Blog';
        document.getElementById('blogId').value = blog.id;
        document.getElementById('blogTitle').value = blog.title;
        document.getElementById('blogExcerpt').value = blog.excerpt;
        document.getElementById('blogAuthor').value = blog.author;
        document.getElementById('blogDate').value = blog.date;
        document.getElementById('blogImage').value = blog.image;
        currentBlogId = blog.id;
    } else {
        title.textContent = 'Add Blog';
        document.getElementById('blogForm').reset();
        document.getElementById('blogId').value = '';
        currentBlogId = null;
    }
    
    modal.classList.add('active');
}

function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    modal.classList.remove('active');
    document.getElementById('blogForm').reset();
    currentBlogId = null;
}

function editBlog(blog) {
    openBlogModal(blog);
}

async function deleteBlog(blogId) {
    if (!confirm('Are you sure you want to delete this blog?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/blogs/${blogId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            location.reload();
        } else {
            alert('Error deleting blog');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting blog');
    }
}

// Toggle blog star status
async function toggleBlogStar(blogId, currentStarred, evt) {
    const event = evt || window.event;
    const button = event ? event.target.closest('.btn-star') : document.querySelector(`.btn-star[onclick*="${blogId}"]`);
    if (!button) return;
    
    try {
        const response = await fetch(`/api/blogs/${blogId}/star`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            // Update the button and badge without reloading
            const card = button.closest('.admin-card');
            const meta = card.querySelector('.blog-meta');
            
            if (data.starred) {
                button.innerHTML = '⭐';
                button.classList.add('starred');
                button.setAttribute('title', 'Unstar to hide from home page');
                button.setAttribute('onclick', `toggleBlogStar(${blogId}, true, event)`);
                // Add featured badge if it doesn't exist
                if (!meta.querySelector('.star-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'star-badge';
                    badge.textContent = '⭐ Featured';
                    meta.appendChild(badge);
                }
            } else {
                button.innerHTML = '☆';
                button.classList.remove('starred');
                button.setAttribute('title', 'Star to show on home page');
                button.setAttribute('onclick', `toggleBlogStar(${blogId}, false, event)`);
                // Remove featured badge
                const badge = meta.querySelector('.star-badge');
                if (badge) {
                    badge.remove();
                }
            }
        } else {
            alert('Error updating blog star status');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating blog star status');
    }
}

// Form Submissions
document.getElementById('serviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const serviceData = {
        icon: document.getElementById('serviceIcon').value,
        title: document.getElementById('serviceTitle').value,
        description: document.getElementById('serviceDescription').value
    };
    
    const serviceId = document.getElementById('serviceId').value;
    const url = serviceId ? `/api/services/${serviceId}` : '/api/services';
    const method = serviceId ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });
        
        if (response.ok) {
            location.reload();
        } else {
            alert('Error saving service');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving service');
    }
});

document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const blogData = {
        title: document.getElementById('blogTitle').value,
        excerpt: document.getElementById('blogExcerpt').value,
        author: document.getElementById('blogAuthor').value,
        date: document.getElementById('blogDate').value,
        image: document.getElementById('blogImage').value
    };
    
    const blogId = document.getElementById('blogId').value;
    const url = blogId ? `/api/blogs/${blogId}` : '/api/blogs';
    const method = blogId ? 'PUT' : 'POST';
    
    // Preserve starred status when editing
    if (blogId) {
        // Find the star button for this blog to get current starred status
        const starButtons = document.querySelectorAll('.btn-star');
        for (const starBtn of starButtons) {
            const onclickAttr = starBtn.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`toggleBlogStar(${blogId}`)) {
                blogData.starred = starBtn.classList.contains('starred');
                break;
            }
        }
    } else {
        // New blogs default to not starred
        blogData.starred = false;
    }
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blogData)
        });
        
        if (response.ok) {
            location.reload();
        } else {
            alert('Error saving blog');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving blog');
    }
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const serviceModal = document.getElementById('serviceModal');
    const blogModal = document.getElementById('blogModal');
    
    if (e.target === serviceModal) {
        closeServiceModal();
    }
    if (e.target === blogModal) {
        closeBlogModal();
    }
});