import TaskListItem from "./TaskListItem";

function TaskList({
  tasks,
  loading,
  onStatusChange,
  onDueDateChange,
  onEdit,
  onDelete,
  emptyMessage = "No tasks found.",
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="glass rounded-2xl h-[68px] animate-pulse"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="card text-center py-14 animate-fade-in">
        <div className="text-5xl mb-4">🗂️</div>
        <p className="text-surface-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <TaskListItem
          key={task.$id}
          task={task}
          index={index}
          onStatusChange={onStatusChange}
          onDueDateChange={onDueDateChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
