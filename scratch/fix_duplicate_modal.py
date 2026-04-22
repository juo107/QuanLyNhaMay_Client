import os

path = r'c:\Users\Juo\Desktop\TanTienTask\QuanLyNhaMay_Client\src\pages\ProductionStatus.tsx'
with open(path, 'rb') as f:
    content = f.read()

# Pattern for the end of the first Modal and the start of garbage
# </Modal>\nóng
search_pattern = b'</Modal>\r\n\xc3\xb3ng' # Try with \r\n first
if search_pattern not in content:
    search_pattern = b'</Modal>\n\xc3\xb3ng' # Try with \n

idx = content.find(search_pattern)
if idx != -1:
    # Find the next </Modal> to delete the whole block
    end_modal_idx = content.find(b'</Modal>', idx + 10)
    if end_modal_idx != -1:
        # We want to keep the first </Modal> (at idx) and delete everything until after the second </Modal>
        new_content = content[:idx+8] + content[end_modal_idx+8:]
        with open(path, 'wb') as f:
            f.write(new_content)
        print("Successfully removed duplicate Modal code.")
    else:
        print("Found the start but not the end of the duplicate block.")
else:
    print("Could not find the duplicate Modal pattern.")
    # Debug: print surrounding area of where it might be
    last_idx = content.rfind(b'</Modal>')
    if last_idx != -1:
        print(f"Last </Modal> at {last_idx}")
        print(f"Next 20 bytes: {content[last_idx:last_idx+20]}")
