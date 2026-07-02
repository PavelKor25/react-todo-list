import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [todoText, setTodoText] = useState("");
  const [todosList, setTodosList] = useState(() => {
    const savedTodos = localStorage.getItem("todos"); // 'todos' is the Key of localStorage data
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [editingTodo, setEditingTodo] = useState(""); // Chosen todo-text for edit
  const [editingTodoID, setEditingTodoID] = useState(); // ID of editing todo object

  // after re-render these constants update data and takes changed result
  // Index of edit task object from todosList, returns -1 if this isn't exist
  const editTaskIndex = todosList.findIndex((todo) => todo.isEditing);
  const isAnyTaskEditing = editTaskIndex !== -1;

  const updateParamsInTodoList = (id, updateParams) =>
    setTodosList((prev) =>
      prev.map((todoObj) =>
        todoObj.id === id ? { ...todoObj, ...updateParams } : todoObj,
      ),
    );

  useEffect(() => {
    console.log("useEffect activated");
    localStorage.setItem("todos", JSON.stringify(todosList));
  }, [todosList]);

  // Add new todo to the list
  function handleAddTodo(taskText) {
    console.log("addTodo()");
    const correctTaskText = taskText.trim();
    if (correctTaskText !== "") {
      const newTodo = {
        id: Date.now(),
        inputText: correctTaskText,
        savedText: correctTaskText,
        isCompleted: false,
        isEditing: false,
      };
      setTodosList((prev) => [...prev, newTodo]);
      setTodoText("");
    } else {
      console.log("Nothing added. Empty todo text.");
    }
  }

  // Start editing todo text
  function handleEdit(e) {
    console.log("handleEdit()");
    const todoID = Number(e.target.name);
    const prevEditingTask = isAnyTaskEditing ? todosList[editTaskIndex] : null;
    console.log(`prevEditingTask: ${JSON.stringify(prevEditingTask)}`);

    setTodosList((prev) =>
      prev.map((todoObj) => {
        // 1. Close last task edit if this exists
        if (prevEditingTask && prevEditingTask.id === todoObj.id) {
          console.log(`first cognition setTodos() called`);
          return {
            ...todoObj,
            isEditing: false,
            inputText: prevEditingTask.savedText, // Input text must be synchronized with saved text while task isn't editing
          };
        }
        // 2. Switch task to the edit mod
        if (todoObj.id === todoID) {
          console.log(`second cognition setTodos() called`);
          return {
            ...todoObj,
            isEditing: true,
          };
        }
        // 3. All other tasks not changed
        return todoObj;
      }),
    );
    console.log(`setTodosList() completed in handleEdit()`);

    console.log(`todoID: ${todoID}`);
    const refChosenTask = todosList.find((todo) => todo.id === todoID);
    if (!refChosenTask) return;
    const { inputText, id } = refChosenTask;
    setEditingTodo(inputText);
    setEditingTodoID(id);
  }

  function handleDelete(e) {
    console.log("handleDelete()");
    const todoID = e.target.name;
  }

  function handleClearAll() {
    console.log("handleClearAll()");
  }

  function handleChange() {
    const correctEditingTodo = editingTodo.trim();
    if (correctEditingTodo !== "") {
      updateParamsInTodoList(editingTodoID, {
        savedText: correctEditingTodo,
        inputText: correctEditingTodo,
        isEditing: false,
      });
      setEditingTodo("");
    }
  }

  function handleAddSubmit(e) {
    console.log("handleAddSubmit()");
    e.preventDefault();
    handleAddTodo(todoText);
  }

  function handleEditSubmit(e) {
    console.log("handleEditSubmit()");
    e.preventDefault();
    handleChange();
  }

  return (
    <>
      <h1>Todo list</h1>

      <form hidden={isAnyTaskEditing} onSubmit={handleAddSubmit}>
        <input
          type="text"
          value={todoText}
          onInput={(e) => setTodoText(e.target.value)}
          placeholder="Add your new todo:"
        />
        <button type="submit">add todo</button>
        <button onClick={handleClearAll}>clear all</button>
      </form>

      <ul>
        {todosList.map((todo) => (
          <div key={todo.id} style={{ backgroundColor: "rgb(235, 195, 135)" }}>
            {todo.isEditing ? (
              /* Editing code part for only selected todo */
              <form onSubmit={handleEditSubmit}>
                <input
                  value={editingTodo}
                  onInput={(e) => setEditingTodo(e.target.value)}
                  placeholder="Edit todo"
                />
                <button type="submit">Save</button>
              </form>
            ) : (
              /* Standard todo code part with edit and delete buttons */
              <>
                <p>{todo.savedText}</p>
                <button name={todo.id} onClick={handleEdit}>
                  Change
                </button>
                {/* Потом важно будет разобраться в обработки удаления - где и как расставить форму */}
                <button name={todo.id} onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </ul>

      <div style={{ border: "black solid 1px" }}>
        <p>todoText: {todoText}</p>
        <p>editingTodo.id: {editingTodo?.id}</p>
        <p>editingTodo.inputText: {editingTodo?.inputText}</p>
        <p>editingTodo.savedText: {editingTodo?.savedText}</p>
        <p>todosList[0].id: {todosList[0]?.id}</p>
      </div>
    </>
  );
}

export default App;
