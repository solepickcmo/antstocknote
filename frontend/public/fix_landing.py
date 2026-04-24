import os

path = 'frontend/public/landing.html'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Remove any previous appended scripts (simplified pattern)
    # The corrupted characters look like щ컮瑜 so we might need a broader cleanup
    # We find the end of the original content. The original content ends with </html>
    end_tag = '</html>'
    idx = content.find(end_tag)
    if idx != -1:
        content = content[:idx + len(end_tag)]
    
    # Append the script reference cleanly with newlines
    new_script = "\n<script src='/landing_script.js'></script>\n"
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content + new_script)
    print("Successfully patched landing.html with UTF-8 encoding")
else:
    print("File not found")
