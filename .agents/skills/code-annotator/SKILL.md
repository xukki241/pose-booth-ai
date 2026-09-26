---
name: code-annotator
description: >-
  Code annotation and docstring writer skill for enriching source code with JSDoc,
  Python docstrings, inline architectural explanations, and formula descriptions.
---

# Code Annotator & Commenting Skill

Use this skill when adding comments, JSDoc/TypeDoc, Python docstrings, or inline math/algorithm explanations to codebase files.

## Guidelines & Best Practices

### 1. Preservation First
- Never modify non-comment logic or rewrite working code unless explicitly requested.
- Respect existing formatting, indentation, and docstring conventions.

### 2. Python Docstrings (Google / NumPy Style)
```python
def calculate_oks(detected_keypoints: np.ndarray, target_keypoints: np.ndarray) -> float:
    """Calculates Object Keypoint Similarity (OKS) between detected and target poses.

    Args:
        detected_keypoints (np.ndarray): Array of shape (17, 3) containing (x, y, confidence).
        target_keypoints (np.ndarray): Array of shape (17, 3) containing ground truth (x, y, v).

    Returns:
        float: Similarity score between 0.0 and 1.0.
    """
```

### 3. TypeScript / JavaScript JSDoc
```typescript
/**
 * Renders the interactive Huawei AR Silk Contour overlay on target canvas.
 *
 * @param ctx - Render context 2D.
 * @param keypoints - 33 normalized landmark coordinates from MediaPipe.
 * @param color - Champagne gold (#FCD34D) or Cyan accent color.
 */
```

### 4. Inline & Architectural Comments
- Explain **WHY** a decision was made, not just **WHAT** the code does.
- Annotate mathematical formulas, matrix operations, or non-obvious regex logic.
