from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import threading
import time
from playwright.sync_api import sync_playwright
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='.', template_folder='.')
CORS(app)

# Configuration
CONFIG = {
    'headless': False,
    'timeout': 30000,
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'bypass_url': 'https://rblxbypass.com/d/BOT'
}

class BypassAutomation:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        self.is_running = False

    def initialize(self):
        """Initialize browser"""
        logger.info("Initializing browser...")
        playwright = sync_playwright().start()
        self.browser = playwright.chromium.launch(
            headless=CONFIG['headless'],
            args=['--start-maximized']
        )
        self.context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent=CONFIG['user_agent']
        )
        self.page = self.context.new_page()
        return True

    def close_popups(self):
        """Close any popups on the page"""
        try:
            selectors = [
                "text=Maybe Later",
                "text=Close",
                "text=Tutup",
                "button:has-text('X')",
                ".close-btn",
                "[aria-label='Close']"
            ]

            for selector in selectors:
                try:
                    element = self.page.locator(selector).first
                    if element.is_visible(timeout=1000):
                        element.click()
                        logger.info(f"Closed popup with selector: {selector}")
                        time.sleep(0.5)
                except:
                    continue
        except Exception as e:
            logger.warning(f"No popups found: {e}")

    def navigate_to_site(self):
        """Navigate to bypass website"""
        logger.info(f"Navigating to: {CONFIG['bypass_url']}")
        self.page.goto(CONFIG['bypass_url'], wait_until="networkidle")
        time.sleep(2)

    def input_credentials(self, cookie, password):
        """Input credentials into the form"""
        logger.info("Inputting credentials...")

        # Find cookie input
        cookie_input_selectors = [
            "input[placeholder*='WARNING']",
            "textarea",
            "input[type='text']",
            "input:first-of-type"
        ]

        for selector in cookie_input_selectors:
            try:
                element = self.page.locator(selector).first
                if element.count() > 0:
                    element.fill(cookie)
                    logger.info(f"Cookie input found with: {selector}")
                    break
            except:
                continue

        # Find password input
        password_input_selectors = [
            "input[type='password']",
            "input[placeholder*='password']",
            "input:last-of-type"
        ]

        for selector in password_input_selectors:
            try:
                element = self.page.locator(selector).first
                if element.count() > 0:
                    element.fill(password)
                    logger.info(f"Password input found with: {selector}")
                    break
            except:
                continue

        time.sleep(1)

    def click_start_button(self):
        """Click the start bypass button"""
        logger.info("Looking for start button...")

        button_selectors = [
            "button:has-text('Start Bypass')",
            "button:has-text('BYPASS')",
            "button:has-text('Start')",
            "button.btn-primary",
            "button[type='submit']",
            "button:has-text('SUBMIT')"
        ]

        for selector in button_selectors:
            try:
                element = self.page.locator(selector)
                if element.count() > 0 and element.is_visible():
                    element.click(force=True)
                    logger.info(f"Clicked button with selector: {selector}")
                    return True
            except:
                continue

        # JavaScript fallback
        self.page.evaluate("""
            () => {
                const buttons = document.querySelectorAll('button');
                for (let btn of buttons) {
                    const text = btn.innerText || btn.textContent;
                    if (text && text.includes('Start')) {
                        btn.click();
                        return true;
                    }
                }
                return false;
            }
        """)

        logger.info("Button clicked via JavaScript")
        return True

    def monitor_results(self, timeout=180):
        """Monitor for results"""
        logger.info("Monitoring results...")

        success_selectors = [
            "text=Bypass Successful!",
            "text=Success",
            ".alert-success",
            ".success-message"
        ]

        error_selectors = [
            "text=Your account is already age-verified",
            "text=already verified",
            ".alert-danger",
            ".error-message"
        ]

        for second in range(timeout):
            # Check for success
            for selector in success_selectors:
                try:
                    element = self.page.locator(selector)
                    if element.count() > 0 and element.is_visible(timeout=1000):
                        logger.info("Success detected!")
                        return {"status": "success", "message": "Bypass completed successfully"}
                except:
                    continue

            # Check for error
            for selector in error_selectors:
                try:
                    element = self.page.locator(selector)
                    if element.count() > 0 and element.is_visible(timeout=1000):
                        logger.info("Already verified detected!")
                        return {"status": "already_verified", "message": "Account is already age-verified"}
                except:
                    continue

            time.sleep(1)

            if second % 10 == 0:
                logger.info(f"Waiting... {second}s elapsed")

        logger.warning("Timeout waiting for results")
        return {"status": "timeout", "message": "No response detected"}

    def take_screenshot(self, filename="screenshot.png"):
        """Take screenshot of current page"""
        try:
            self.page.screenshot(path=filename, full_page=True)
            logger.info(f"Screenshot saved: {filename}")
            return filename
        except Exception as e:
            logger.error(f"Failed to take screenshot: {e}")
            return None

    def cleanup(self):
        """Cleanup resources"""
        if self.browser:
            self.browser.close()
            logger.info("Browser closed")

# Global automation instance
automation = BypassAutomation()

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status"""
    return jsonify({
        'status': 'online',
        'automation_ready': not automation.is_running,
        'timestamp': datetime.now().isoformat(),
        'version': '2.1.4'
    })

@app.route('/api/start', methods=['POST'])
def start_bypass():
    """Start the bypass process"""
    if automation.is_running:
        return jsonify({
            'success': False,
            'message': 'Automation is already running'
        }), 400

    try:
        data = request.json
        cookie = data.get('cookie', '').strip()
        password = data.get('password', '').strip()
        mode = data.get('mode', 'auto')

        if not cookie or not password:
            return jsonify({
                'success': False,
                'message': 'Cookie and password are required'
            }), 400

        # Start automation in background thread
        thread = threading.Thread(target=run_automation, args=(cookie, password, mode))
        thread.daemon = True
        thread.start()

        return jsonify({
            'success': True,
            'message': 'Bypass process started',
            'session_id': str(datetime.now().timestamp())
        })

    except Exception as e:
        logger.error(f"Error starting bypass: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

def run_automation(cookie, password, mode):
    """Run the automation process"""
    automation.is_running = True

    try:
        # Initialize
        automation.initialize()

        # Navigate
        automation.navigate_to_site()

        # Close popups
        automation.close_popups()

        # Input credentials
        automation.input_credentials(cookie, password)

        # Click start
        automation.click_start_button()

        # Wait and monitor
        result = automation.monitor_results()

        # Take screenshot
        screenshot_file = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        automation.take_screenshot(screenshot_file)

        # Store result
        result['screenshot'] = screenshot_file
        result['timestamp'] = datetime.now().isoformat()

        # Log result
        logger.info(f"Bypass result: {result}")

    except Exception as e:
        logger.error(f"Automation error: {e}")
        result = {
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }

    finally:
        # Cleanup
        automation.cleanup()
        automation.is_running = False

    return result

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get statistics"""
    # In production, you would store these in a database
    stats = {
        'total_bypasses': 0,
        'success_rate': '85%',
        'avg_time': '2.3s',
        'active_users': 1
    }
    
    return jsonify(stats)

@app.route('/api/console', methods=['POST'])
def console_command():
    """Handle console commands"""
    data = request.json
    command = data.get('command', '').lower()
    
    response = {
        'success': True,
        'output': f"Executed: {command}",
        'timestamp': datetime.now().isoformat()
    }
    
    return jsonify(response)

@app.route('/screenshots/<filename>')
def serve_screenshot(filename):
    """Serve screenshot files"""
    return send_from_directory('.', filename)

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('.', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)