export const SignUpFormControls = [
  {
    id: "name",
    label: "Name",
    placeholder: "Enter your name",
    componentType: "input",
    type: "text",
  },
  {
    id: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    id: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const SignInFormControls = [
  {
    id: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    id: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const projectStatusOptions = [
  { id: "Planned", label: "Planned" },
  { id: "In Progress", label: "In Progress" },
  { id: "On Hold", label: "On Hold" },
  { id: "Completed", label: "Completed" },
];

export const addNewProjectFormControls = [
  {
    id: "name",
    type: "text",
    placeholder: "Enter project name",
    label: "Project Name",
    componentType: "input",
  },
  {
    id: "description",
    type: "text",
    placeholder: "Enter project description",
    label: "Description",
    componentType: "input",
  },
  {
    id: "client",
    type: "text",
    placeholder: "Enter client/company name",
    label: "Client / Company",
    componentType: "input",
  },
  {
    id: "manager",
    type: "text",
    placeholder: "Enter project manager name",
    label: "Project Manager",
    componentType: "input",
  },
  {
    id: "startDate",
    type: "date",
    placeholder: "Select start date",
    label: "Start Date",
    componentType: "input",
  },
  {
    id: "status",
    placeholder: "Select project status",
    label: "Status",
    componentType: "select",
    options: projectStatusOptions,
  },
];

export const scrumBoardOptions = [
  { id: "todo", label: "To Do" },
  { id: "inProgress", label: "In Progress" },
  { id: "blocked", label: "Blocked" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

// Task form controls — status field is intentionally omitted here.
// Status is locked to "todo" on creation. It becomes editable only
// inside a sprint (the sprint detail view provides its own inline controls).
export const addNewTaskFormControls = [
  {
    id: "title",
    type: "text",
    placeholder: "Enter title",
    label: "Title",
    componentType: "input",
  },
  {
    id: "description",
    type: "text",
    placeholder: "Enter description",
    label: "Description",
    componentType: "input",
  },
  {
    id: "priority",
    placeholder: "Select priority",
    label: "Priority",
    componentType: "select",
    options: [
      { id: "low", label: "Low" },
      { id: "medium", label: "Medium" },
      { id: "high", label: "High" },
    ],
  },
];

// Story form controls — no dates, just title + description
export const addNewStoryFormControls = [
  {
    id: "title",
    type: "text",
    placeholder: "Enter story title",
    label: "Story Title",
    componentType: "input",
  },
  {
    id: "description",
    type: "text",
    placeholder: "Describe the user story",
    label: "Description",
    componentType: "input",
  },
];

// Sprint form controls
export const addNewSprintFormControls = [
  {
    id: "name",
    type: "text",
    placeholder: "e.g. Sprint 1",
    label: "Sprint Name",
    componentType: "input",
  },
  {
    id: "goal",
    type: "text",
    placeholder: "What is the goal of this sprint?",
    label: "Sprint Goal",
    componentType: "input",
  },
  {
    id: "startDate",
    type: "date",
    placeholder: "Start date",
    label: "Start Date",
    componentType: "input",
  },
  {
    id: "endDate",
    type: "date",
    placeholder: "End date (default: 2 weeks after start)",
    label: "End Date",
    componentType: "input",
  },
];
