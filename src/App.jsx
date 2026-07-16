import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [todoText, setTodoText] = useState("");
  // Using lazy initialization to avoid reading from localStorage on every render
  const [todosList, setTodosList] = useState(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  })
  const [editingTodo, setEditingTodo] = useState("");         // Chosen todo-text for edit
  const [editingTodoID, setEditingTodoID] = useState(null);   // ID of editing todo object

  // Index of the task currently being edited (returns -1 if none)
  const editingTaskIndex = todosList.findIndex((todo) => todo.isEditing);
  const hasActiveEditTask = editingTaskIndex !== -1;

  const updateTodoParams = (id, updateParams) =>
    setTodosList((prev) =>
      prev.map((todoObj) =>
        todoObj.id === id ? { ...todoObj, ...updateParams } : todoObj,
      ),
    );

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todosList));
  }, [todosList]);

  function handleAddTodo(taskText) {
    const correctTaskText = taskText.trim();
    if (correctTaskText !== "") {
      const newTodo = {
        id: Date.now(),
        savedText: correctTaskText,
        isCompleted: false,
        isEditing: false,
      };
      setTodosList((prev) => [...prev, newTodo]);
      setTodoText("");
    }
  }

  // Start editing todo text
  function handleEdit(e) {
    const todoID = Number(e.target.name);
    const prevEditingTask = hasActiveEditTask ? todosList[editingTaskIndex] : null;

    setTodosList((prev) =>
      prev.map((todoObj) => {
        // 1. Close previous task edit mode if it exists
        if (prevEditingTask && prevEditingTask.id === todoObj.id) {
          return {
            ...todoObj,
            isEditing: false,
          };
        }
        // 2. Switch the selected task to edit mode
        if (todoObj.id === todoID) {
          return {
            ...todoObj,
            isEditing: true,
          };
        }
        // 3. Keep all other tasks unchanged
        return todoObj;
      }));

    const refChosenTask = todosList.find((todo) => todo.id === todoID);
    if (!refChosenTask) return;
    const { savedText, id } = refChosenTask;
    setEditingTodo(savedText);
    setEditingTodoID(id);
    setTodoText("");
  }

  function handleDelete(e) {
    const todoID = Number(e.target.name);
    const prevEditingTask = hasActiveEditTask ? todosList[editingTaskIndex] : null;

    setTodosList(prev => {
      return prev
        .filter(todoObj => todoObj.id !== todoID)
        .map(todoObj => {
          // 1. Close last task edit if exists
          if (prevEditingTask && prevEditingTask.id === todoObj.id) {
            return {
              ...todoObj,
              isEditing: false,
            };
          }
          // 2. Return rest of todo objects
          return todoObj;
        })
    })

  }

  function handleClearAll() {
    setTodoText("");
    setEditingTodo("");
    setEditingTodoID(null);
    setTodosList([]);
  }

  function handleChange() {
    const correctEditingTodo = editingTodo.trim();
    if (correctEditingTodo !== "") {
      updateTodoParams(editingTodoID, {
        savedText: correctEditingTodo,
        isEditing: false,
      });
      setEditingTodo("");
    }
  }

  function handleCancelEdit() {
    setTodosList(prev =>
      prev.map(todoObj =>
        todoObj.id === editingTodoID
          ? { ...todoObj, isEditing: false, }
          : todoObj
      )
    )
  }

  function handleToggleComplete(id, currentStatus) {
    updateTodoParams(id, { isCompleted: !currentStatus })
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    handleAddTodo(todoText);
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    handleChange();
  }

  return (
    <div className="app-container">
      <h1>Todo list</h1>
      <form
        className="add-todo-form"
        hidden={hasActiveEditTask}
        onSubmit={handleAddSubmit}>
        <input
          type="text"
          value={todoText}
          onInput={(e) => setTodoText(e.target.value)}
          placeholder="Add your new todo:"
        />
        <button type="submit">add todo</button>
        <button onClick={handleClearAll}>clear all tasks</button>
      </form>

      <ul>
        {todosList.map((todo) => (
          <div key={todo.id} className="todo-item-container">
            {todo.isEditing ? (
              /* Edit mode layout for the selected todo */
              <form onSubmit={handleEditSubmit}>
                <input
                  value={editingTodo}
                  onInput={(e) => setEditingTodo(e.target.value)}
                  placeholder="Edit todo"
                />
                <div className="edit-buttons">
                  <button type="submit">
                    Save
                  </button>
                  <button onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Default view layout with complete, edit, and delete actions */
              <>
                <input
                  type="checkbox"
                  checked={todo.isCompleted}
                  onChange={() => handleToggleComplete(todo.id, todo.isCompleted)}
                />
                <p style={{ textDecoration: todo.isCompleted ? "line-through" : "none" }}>
                  {todo.savedText}
                </p>
                <div className="edit-buttons">
                  <button name={todo.id} onClick={handleEdit}>
                    Change
                  </button>
                  <button name={todo.id} onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
}

export default App;
