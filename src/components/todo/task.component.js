class Tasks extends Component {
  constructor() {
    super();
  }

  static directions = {
    UP: 'move-up',
    DOWN: 'move-down'
  };

  static create(data) {
    const task = {
      id: this.id,
      title: data.title,
      description: data?.description ?? '',
      createdAt: this.getCreationDate(),
      state: 0
    };

    this.save(task);

    return task;
  }

  static getCreationDate() {
    const date = new Date();

    return {
      date: date.strftime('e b'),
      time: date.strftime('h:i')
    };
  }

  static get id() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  static getIds() {
    return this.getAll().map(task => task.id);
  }

  static save(task) {
    let tasks = this.getAll();

    tasks.push(task);

    localStorage.tasks = stringify(tasks);
  }

  static update(task, elemRef, updatedField) {
    if (!this.getIds().includes(task.id)) return;

    let tasks = this.getAll();
    let index = tasks.findIndex(x => x.id === task.id);

    tasks[index] = { ...tasks[index], ...task };
    elemRef.querySelector(`.task-${updatedField}`).innerText = task[updatedField];

    localStorage.tasks = stringify(tasks);
  }

  static getById(id) {
    return this.getAll().find(task => task.id === id);
  }

  static toggle(elem) {
    const tasks = this.getAll();

    let task = tasks.find(x => x.id === elem.id);

    if (!task) return;

    task.state = !task.state;
    localStorage.tasks = JSON.stringify(tasks);

    elem.setAttribute('status', this.getStatus(task.state));
  }

  static clean(tasks) {
    if (!tasks.length) return Tasks.remove(tasks);
    return tasks.forEach(task => Tasks.remove(task));
  }

  static remove(task) {
    let tasks = this.getAll();

    tasks = tasks.filter(x => x.id !== task.id);
    localStorage.tasks = stringify(tasks);

    task.classList.add('remove');

    setTimeout(() => task.remove(), 350);
  }

  static getStatus(state) {
    return ['todo', 'done'][state | 0];
  }

  static getAll() {
    if (!localStorage.tasks) return [];
    return parse(localStorage.tasks);
  }

  static getAllTemplates() {
    return this
      .getAll()
      .map((task, i) => this.template(task, i))
      .join('');
  }

  static move(elem, direction) {
    elem.setAttribute('move-direction', direction);

    let tasks = this.getAll();

    const index = tasks.findIndex(f => f.id === elem.id);
    const currentTask = tasks[index];
    let lookup = index + 1;

    if (direction === this.directions.UP) lookup = index - 1;

    tasks[index] = tasks[lookup];
    tasks[lookup] = currentTask;

    localStorage.tasks = JSON.stringify(tasks);
  }

  static getTaskIndex(id) {
    return this.getAll().findIndex(task => task.id === id);
  }

  static isLast(idx) {
    return (this.getAll().length - 1) === idx;
  }

  static template(task, index = -1) {
    return `
        <task index="${index}" status="${this.getStatus(task.state)}" id="${task.id}" class="slide-in">
            ${EditTaskPanel.template(task)}
            <div class="task-controls">
              <button class='task-control task-move-up control-arrows' onclick="Tasks.move(this.parentNode.parentNode, Tasks.directions.UP)">
                <i class="material-icons">keyboard_arrow_up</i>
              </button>
              <button class="task-toggle" onclick="Tasks.toggle(this.parentNode.parentNode)"></button>
              <button class='task-control task-move-down control-arrows' onclick="Tasks.move(this.parentNode.parentNode, Tasks.directions.DOWN)">
                <i class="material-icons">keyboard_arrow_down</i>
              </button>
            </div>
            <rows>
                <p class="task-title">${task.title}</p>
                <p class="task-description">${task.description}</p>
                <p class="row-end added-at">${task.createdAt.date} - <span>${task.createdAt.time}</span></p>
                <div class="task-options">
                  <button class="task-option edit-task" onclick="EditTaskPanel.open(this.parentNode.parentNode.parentNode)">
                    <i class="material-icons">edit</i>
                  </button>
                  <button class="task-option add-task-link">
                    <i class="material-icons">link</i>
                  </button>
                  <button class="task-option close-task" onclick="Tasks.remove(this.parentNode.parentNode.parentNode)">
                    <i class="material-icons">close</i>
                  </button>
                </div>
            </rows>
        </task>`;
  }
}

class EditTaskPanel extends Component {
  static refs = {
    editTaskPanel: '.edit-task-panel'
  };

  static taskElemRef;

  constructor() {
    super();
  }

  static close(panel) {
    this.taskElemRef.classList.remove('expand');
    panel.classList.remove('active');
  }

  static open(task) {
    this.taskElemRef = task;

    const panel = task.querySelector(this.refs.editTaskPanel);

    task.classList.add('expand');
    panel.classList.add('active');
  }

  static updateField(fieldName, event) {
    const { target, key } = event;

    if (key === 'Escape' || key === 'Enter') {
      this.close(target.parentNode.parentNode.parentNode);
      return;
    }

    let task = Tasks.getById(this.taskElemRef.id);
    task = { ...task, [fieldName]: target.value };

    target.setAttribute('value', target.value);

    Tasks.update(task, this.taskElemRef, fieldName);
  }

  static template(task) {
    return `
        <div class="edit-task-panel">
            <div class="edit-task-header heading">
              <h1 class="edit-task-header-title">Edit task</h1>
              <button class="task-option heading-close close-edit-task-panel" onclick="EditTaskPanel.close(this.parentNode.parentNode)">
                <i class="material-icons">close</i>
              </button>
            </div>
            <div class="edit-task-fields">
              <label>
                <input class="edit-task-field edit-task-title" value="${task.title}" onkeyup="EditTaskPanel.updateField('title', event)" required></input>
                <p>Title</p>
              </label>
              <label>
                <input class="edit-task-field edit-task-description" value="${task.description}" onkeyup="EditTaskPanel.updateField('description', event)" required></input>
                <p>Description</p>
              </label>
            </div>
        </div>
      `;
  }
}
