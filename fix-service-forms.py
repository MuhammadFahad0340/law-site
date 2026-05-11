#!/usr/bin/env python3
"""
Quick fix script for M&H Advocates service forms
Fixes common issues across all service forms
"""

import os
import re
from pathlib import Path

def fix_service_form(file_path):
    """Fix common issues in a service form file"""
    print(f"Fixing {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix 1: Remove onsubmit="return false;" and add data-service-type
    service_name = Path(file_path).stem.replace('-form', '')
    content = re.sub(
        r'<form[^>]*onsubmit="return false;"[^>]*>',
        f'<form method="POST" data-service-type="{service_name}" style="margin-top: 30px">',
        content
    )
    
    # Fix 2: Fix footer links (add ../ prefix)
    footer_links = [
        'about.html', 'service.html', 'experience.html', 
        'contact.html', 'login.html', 'termsOfService.html',
        'privacypolicy.html', 'disclaimer.html'
    ]
    
    for link in footer_links:
        # Only fix if it doesn't already have ../
        content = re.sub(
            f'href="{link}"',
            f'href="../{link}"',
            content
        )
    
    # Fix 3: Add centralized form handler script
    script_section = '''    <!-- Load Supabase -->
    <script src="https://unpkg.com/@supabase/supabase-js"></script>
    
    <!-- Load centralized form handler -->
    <script src="../js/form-handler.js"></script>
    
    <!-- Load jQuery and other libraries -->
    <script src="../js/jquery-1.11.1.min.js"></script>
    <script src="../js/plugins.js"></script>
    <script src="../js/app.js"></script>'''
    
    # Remove old script sections and add new one
    content = re.sub(
        r'<script src="\.\./js/jquery.*?<script src="\.\./js/app\.js"></script>',
        script_section,
        content,
        flags=re.DOTALL
    )
    
    # Fix 4: Remove duplicate Supabase scripts and inline form handlers
    content = re.sub(
        r'<script>.*?supabase.*?</script>',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Fix 5: Add proper form validation attributes
    content = re.sub(
        r'<input type="tel"([^>]*)>',
        r'<input type="tel"\1 pattern="[0-9+\-\s\(\)]{10,15}">',
        content
    )
    
    content = re.sub(
        r'<input type="email"([^>]*)>',
        r'<input type="email"\1>',
        content
    )
    
    # Write the fixed content back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Fixed {file_path}")

def main():
    """Main function to fix all service forms"""
    service_forms_dir = Path('service-forms')
    
    if not service_forms_dir.exists():
        print("❌ service-forms directory not found!")
        return
    
    # Find all HTML files in service-forms directory
    html_files = list(service_forms_dir.glob('*.html'))
    
    if not html_files:
        print("❌ No HTML files found in service-forms directory!")
        return
    
    print(f"Found {len(html_files)} service form files to fix...")
    
    for file_path in html_files:
        try:
            fix_service_form(file_path)
        except Exception as e:
            print(f"❌ Error fixing {file_path}: {e}")
    
    print(f"\n✅ Finished fixing {len(html_files)} service forms!")
    print("\nNext steps:")
    print("1. Test the forms in your browser")
    print("2. Verify Supabase integration")
    print("3. Check form validation")

if __name__ == "__main__":
    main()