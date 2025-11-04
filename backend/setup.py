#!/usr/bin/env python
"""
Setup script for Digital Nomad Council (DNC) Platform
"""
import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up Digital Nomad Council (DNC) Platform")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not Path("manage.py").exists():
        print("❌ Error: manage.py not found. Please run this script from the project root directory.")
        sys.exit(1)
    
    # Create necessary directories
    directories = [
        "logs",
        "static",
        "media",
        "media/avatars",
        "media/achievements",
        "media/projects/covers",
        "media/events/covers"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {directory}")
    
    # Copy environment file
    if not Path(".env").exists() and Path("env.example").exists():
        import shutil
        shutil.copy("env.example", ".env")
        print("✓ Created .env file from env.example")
        print("⚠️  Please update .env with your actual configuration values")
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("❌ Failed to install dependencies. Please check your Python environment.")
        sys.exit(1)
    
    # Run Django migrations
    if not run_command("python manage.py makemigrations", "Creating database migrations"):
        print("❌ Failed to create migrations.")
        sys.exit(1)
    
    if not run_command("python manage.py migrate", "Running database migrations"):
        print("❌ Failed to run migrations.")
        sys.exit(1)
    
    # Create initial data
    if not run_command("python manage.py create_initial_data", "Creating initial data"):
        print("⚠️  Failed to create initial data. You can run this manually later.")
    
    # Collect static files
    if not run_command("python manage.py collectstatic --noinput", "Collecting static files"):
        print("⚠️  Failed to collect static files. You can run this manually later.")
    
    print("\n" + "=" * 60)
    print("🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Update .env file with your configuration")
    print("2. Create a superuser: python manage.py createsuperuser")
    print("3. Start the development server: python manage.py runserver")
    print("4. Visit http://localhost:8000 to see your application")
    print("\nDefault users created:")
    print("- Admin: admin/admin123")
    print("- Mentor: mentor1/mentor123")
    print("- Mentee: mentee1/mentee123")
    print("\nFor production deployment, see the README.md file.")

if __name__ == "__main__":
    main()
