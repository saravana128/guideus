import {
  TASK_CATEGORY,
  TASK_CATEGORY_LABELS,
  TASK_CATEGORY_ICONS,
  TASK_CATEGORY_COLORS,
} from "../../utils/constants";

function CategoryBadge({ category, className = "" }) {
  const key = TASK_CATEGORY_LABELS[category] ? category : TASK_CATEGORY.ACTION;
  return (
    <span
      className={`badge ${TASK_CATEGORY_COLORS[key]} ${className}`}
      title={`${TASK_CATEGORY_LABELS[key]} task`}
    >
      <span aria-hidden="true">{TASK_CATEGORY_ICONS[key]}</span>
      {TASK_CATEGORY_LABELS[key]}
    </span>
  );
}

export default CategoryBadge;
