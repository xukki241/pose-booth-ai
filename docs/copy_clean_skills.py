"""
Copy only approved clean skills to global plugins directory
"""
import json
import shutil
from pathlib import Path

def main():
    scan_json = Path(r"C:\FLM\Ki7\EXE101\docs\skills_security_scan.json")
    target_plugin_dir = Path(r"C:\Users\Admin\.gemini\config\plugins\agentic-awesome-skills")
    target_skills_dir = target_plugin_dir / "skills"

    target_skills_dir.mkdir(parents=True, exist_ok=True)

    with open(scan_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    clean_skills = [
        item for item in data
        if len(item.get("critical", [])) == 0 and len(item.get("warnings", [])) == 0
    ]

    print(f"Total clean skills to install: {len(clean_skills)}")

    copied_count = 0
    for idx, item in enumerate(clean_skills):
        skill_file = Path(item["file"])
        if not skill_file.exists():
            continue
        skill_folder = skill_file.parent
        dest_folder = target_skills_dir / skill_folder.name

        if not dest_folder.exists():
            try:
                shutil.copytree(skill_folder, dest_folder, dirs_exist_ok=True)
                copied_count += 1
            except Exception as e:
                print(f"Error copying {skill_folder.name}: {e}")
        else:
            copied_count += 1

        if (idx + 1) % 500 == 0 or (idx + 1) == len(clean_skills):
            print(f"Progress: {idx + 1}/{len(clean_skills)} skills processed...")

    # Write plugin.json
    plugin_meta = {
        "name": "agentic-awesome-skills",
        "displayName": "Agentic Awesome Skills (Verified Clean)",
        "version": "1.0.0",
        "description": "Collection of community skills scanned and verified for safety. Only clean skills without security or prompt injection risks are included.",
        "author": {
            "name": "sickn33 / Antigravity Security Verified"
        },
        "license": "MIT"
    }

    with open(target_plugin_dir / "plugin.json", "w", encoding="utf-8") as f:
        json.dump(plugin_meta, f, indent=2)

    print(f"\n[SUCCESS] Successfully installed {copied_count} clean skills to {target_plugin_dir}")

if __name__ == "__main__":
    main()
