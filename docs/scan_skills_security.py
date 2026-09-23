"""
Security Scanner for agentic-awesome-skills
Scans all SKILL.md files for prompt injection, malicious content, and suspicious patterns.
"""
import os
import re
import json
from pathlib import Path
from typing import Any

# ============================================================
# Patterns to detect — ordered by severity
# ============================================================

CRITICAL_PATTERNS = [
    # Prompt injection / system override
    (r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+instructions?", "Prompt injection: ignoring instructions"),
    (r"you\s+are\s+now\s+(a|an|the)\s+(?!PikPose|project)", "Prompt injection: identity override"),
    (r"disregard\s+(all\s+)?(previous|prior|above)\s+", "Prompt injection: disregard instructions"),
    (r"jailbreak", "Jailbreak attempt"),
    (r"DAN\s+mode|do\s+anything\s+now", "DAN jailbreak pattern"),
    (r"system\s*:\s*you\s+must", "System prompt injection"),
    (r"\[SYSTEM\]|\[INST\]|\[\/INST\]", "LLM prompt format injection"),
    # Dangerous shell commands
    (r"rm\s+-rf\s+/", "Dangerous: rm -rf /"),
    (r"format\s+c:", "Dangerous: format c:"),
    (r"del\s+/[sS]\s+/[qQ]\s+[a-zA-Z]:\\", "Dangerous: del /s /q"),
    (r":(){ :|:& };:", "Fork bomb"),
]

WARNING_PATTERNS = [
    # Data exfiltration
    (r"curl\s+.*(http|https)://(?!github\.com|raw\.githubusercontent\.com|docs\.google\.com|developers\.google\.com|api\.github\.com|pypi\.org|npmjs\.com|docs\.python\.org|fastapi\.tiangolo\.com)", "Suspicious: curl to non-standard URL"),
    (r"wget\s+.*(http|https)://(?!github\.com|raw\.githubusercontent\.com)", "Suspicious: wget to non-standard URL"),
    (r"send.*api.key|upload.*credentials|exfiltrate", "Possible data exfiltration"),
    # Pipe to shell (common supply chain attack)
    (r"curl.*\|\s*(bash|sh|python|powershell)", "Dangerous: pipe to shell execution"),
    (r"wget.*\|\s*(bash|sh|python)", "Dangerous: pipe to shell execution"),
    # Suspicious npm/pip packages (typosquatting)
    (r"pip\s+install\s+(?!ultralytics|fastapi|torch|numpy|opencv|pillow|pydantic|mediapipe|gsap|next|react|tailwind|shadcn|framer|axios|zod)(\w+\d+\w*|\w*\d+\w+)", "Possible typosquatted package"),
    # Override agent behavior
    (r"override\s+(your\s+)?(safety|security)\s+", "Override safety attempt"),
    (r"bypass\s+(authentication|security|safety)", "Bypass security attempt"),
    (r"execute\s+(arbitrary|any)\s+code", "Arbitrary code execution request"),
    # Credential harvesting
    (r"(send|submit|upload|share|reveal)\s+(your\s+)?(api.?key|token|password|secret|credential)", "Credential harvesting attempt"),
]

INFO_PATTERNS = [
    # External URLs (for review)
    (r"https?://(?!github\.com|raw\.githubusercontent\.com|docs\.|developer|api\.github|pypi\.org|npmjs\.com|python\.org|fastapi\.tiangolo|tailwindcss\.com|nextjs\.org|shadcn\.ui|gsap\.com|mediapipe\.dev|ultralytics\.com|pytorch\.org)\S+", "External URL — review recommended"),
]


def scan_file(filepath: Path) -> dict[str, Any]:
    """Scan a single SKILL.md file and return findings."""
    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return {"error": str(e), "critical": [], "warnings": [], "info": []}

    findings = {
        "file": str(filepath),
        "critical": [],
        "warnings": [],
        "info": [],
    }

    content_lower = content.lower()

    for pattern, desc in CRITICAL_PATTERNS:
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches:
            findings["critical"].append({
                "description": desc,
                "matches": list(set(str(m) for m in matches[:3])),
            })

    for pattern, desc in WARNING_PATTERNS:
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches:
            findings["warnings"].append({
                "description": desc,
                "matches": list(set(str(m) for m in matches[:3])),
            })

    for pattern, desc in INFO_PATTERNS:
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches:
            findings["info"].append({
                "description": desc,
                "count": len(matches),
                "sample": matches[0] if matches else "",
            })

    return findings


def scan_directory(skills_dir: Path) -> list[dict[str, Any]]:
    """Scan all SKILL.md files in directory."""
    skill_files = list(skills_dir.rglob("SKILL.md"))
    print(f"Found {len(skill_files)} SKILL.md files to scan...")

    results = []
    for i, filepath in enumerate(skill_files):
        if i % 100 == 0:
            print(f"  Scanning... {i}/{len(skill_files)}")
        findings = scan_file(filepath)
        results.append(findings)

    return results


def generate_report(results: list[dict[str, Any]]) -> str:
    """Generate human-readable security report."""
    critical_files = [r for r in results if r.get("critical")]
    warning_files = [r for r in results if r.get("warnings") and not r.get("critical")]
    clean_files = [r for r in results if not r.get("critical") and not r.get("warnings")]

    lines = [
        "=" * 70,
        "  PIKPOSE SKILLS SECURITY SCAN REPORT",
        "=" * 70,
        f"Total skills scanned: {len(results)}",
        f"✅ Clean (no issues):  {len(clean_files)}",
        f"⚠️  Warnings:           {len(warning_files)}",
        f"❌ Critical issues:    {len(critical_files)}",
        "",
    ]

    if critical_files:
        lines.append("=" * 70)
        lines.append("❌ CRITICAL — DO NOT INSTALL (blocked)")
        lines.append("=" * 70)
        for r in critical_files:
            skill_name = Path(r["file"]).parent.name
            lines.append(f"\n  ❌ {skill_name}")
            for finding in r["critical"]:
                lines.append(f"     REASON: {finding['description']}")
                for m in finding["matches"]:
                    lines.append(f"     MATCH:  {m[:100]}")

    if warning_files:
        lines.append("\n" + "=" * 70)
        lines.append("⚠️  WARNINGS — Requires your approval before installing")
        lines.append("=" * 70)
        for r in warning_files[:50]:  # Show first 50
            skill_name = Path(r["file"]).parent.name
            lines.append(f"\n  ⚠️  {skill_name}")
            for finding in r["warnings"]:
                lines.append(f"     WARN: {finding['description']}")

        if len(warning_files) > 50:
            lines.append(f"\n  ... and {len(warning_files) - 50} more warning skills")

    lines.append("\n" + "=" * 70)
    lines.append(f"✅ CLEAN SKILLS ({len(clean_files)} total) — Safe to install")
    lines.append("=" * 70)
    for r in clean_files[:20]:
        skill_name = Path(r["file"]).parent.name
        lines.append(f"  ✅ {skill_name}")
    if len(clean_files) > 20:
        lines.append(f"  ... and {len(clean_files) - 20} more clean skills")

    return "\n".join(lines)


if __name__ == "__main__":
    skills_dir = Path(r"C:\FLM\Ki7\EXE101\agentic-awesome-skills-tmp\skills")

    if not skills_dir.exists():
        # Try alternate path
        skills_dir = Path(r"C:\FLM\Ki7\EXE101\agentic-awesome-skills-tmp")

    print(f"Scanning: {skills_dir}")
    results = scan_directory(skills_dir)

    report = generate_report(results)
    print(report)

    # Save JSON results for programmatic access
    output_path = Path(r"C:\FLM\Ki7\EXE101\docs\skills_security_scan.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    report_path = Path(r"C:\FLM\Ki7\EXE101\docs\skills_security_report.txt")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\nJSON saved: {output_path}")
    print(f"Report saved: {report_path}")
