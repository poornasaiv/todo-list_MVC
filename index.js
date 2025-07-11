const APIs = (function(){
    const URL = "http://localhost:3000";

    async function addTask(task){
        return fetch(`${URL}/todos`, {
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(task)
        }).then(res => res.json());
    };

    async function getTasks(){
        return fetch(`${URL}/todos`).then(res => res.json());
    };

    async function deleteTask(id){
        return fetch(`${URL}/todos/${id}`, {
            method: "DELETE"
        }).then(res => res.json());  
    };

    async function updateTask(id, newTitle){
        return fetch(`${URL}/todos/${id}`, {
            method: "PATCH",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(newTitle)
        }).then(res => res.json());
    };

    return {addTask, getTasks, deleteTask, updateTask};
})();


class TodoModel{
    #todos;
    constructor(todos = []){
        this.#todos = todos; 
    };

    setTodos(newTodos){
        this.#todos = newTodos;
    };

    addTodo(newTodo){
        this.#todos.push(newTodo);
    };

    deleteTodo(id){
        this.#todos = this.#todos.filter((todo)=>todo.id!=id);
    };

    getTodos(){
        return this.#todos;
    }

}

class TodoView{
    constructor(){
        this.form = document.querySelector(".form");
        this.input = document.querySelector("#name");
        this.todoList = document.querySelector(".todo-list");
        this.todoListItem = document.querySelector(".todo-list__item");
    }

    renderTasks(tasks){
        tasks.forEach((task) => {
            this.todoList.appendChild(this.createTaskElement(task));
        })
    };

    renderNewTask(task){
        this.todoList.appendChild(this.createTaskElement(task));
    }

    createTaskElement(task){
        const item = document.createElement("div");
        item.setAttribute("class", "todo-list__item")
        this.todoList.appendChild(item);
        item.setAttribute("id", task.id)

        const itemTitle = document.createElement("div");
        itemTitle.innerText = task.title;
        itemTitle.setAttribute("class", "todo-list__item__title");
        item.appendChild(itemTitle);

        const itemAction = document.createElement("div");
        itemAction.setAttribute("class", "todo-list__item__actions");
        item.appendChild(itemAction);

        const editBtn = document.createElement("button");
        editBtn.setAttribute("class", "edit");
        editBtn.innerText = "Edit";
        itemAction.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.setAttribute("class", "delete");
        deleteBtn.innerText = "Delete";
        itemAction.appendChild(deleteBtn);

        return item;
    };

    removeTaskElement(id){
        document.getElementById(id).remove();
    };

    updateTask(id, newTitle){
        document.getElementById(`${id}`).firstElementChild.innerText = newTitle;
    };

    errorAlert(){
        alert("Enter a valid name to add the task");
    };

    clearInput(name){
        this.input.value = "";
    };
}

class TodoController{
    constructor(view, model){
        this.view = view;
        this.model = model;
        this.init();
    };

    init(){
        this.formSubmitEvent();
        this.fetchTasks();
        this.taskDeleteEvent();
        this.taskUpdateEvent()
    };

    async fetchTasks(){
        const tasks = await APIs.getTasks();
        this.model.setTodos(tasks);
        this.view.renderTasks(tasks);
    };

    formSubmitEvent(){
        this.view.form.addEventListener("submit", async (e)=>{
            e.preventDefault();
            const name = this.view.input.value;
            if(name!=null && name!="")
            {
                const title = await APIs.addTask({title : name});
                this.model.addTodo(name);
                this.view.renderNewTask(title);
            }else{
                this.view.errorAlert();
            }
            this.view.clearInput();
        })
    };

    taskDeleteEvent(){
        this.view.todoList.addEventListener("click", async (e)=>{
            if(e.target.classList.contains("delete"))
            {
                const id = e.target.parentElement.parentElement.getAttribute("id");
                await APIs.deleteTask(id);
                this.model.deleteTodo(id);
                this.view.removeTaskElement(id);
            }
        })
    };

    taskUpdateEvent(){
        this.view.todoList.addEventListener("click", async (e)=>{
        if(e.target.classList.contains("edit")){
            const id = e.target.parentElement.parentElement.getAttribute("id");
            const oldTitle = e.target.parentElement.previousSibling.innerText;
            const newTitle = prompt(`Current name : ${oldTitle}. Enter a new name to update`);
            if(newTitle && newTitle.trim() !== "")
            {
            await APIs.updateTask(id, {title:newTitle});
            this.view.updateTask(id, newTitle);
            }
        }
    });
    }
};

const model = new TodoModel();
const view = new TodoView();
const controller = new TodoController(view, model);