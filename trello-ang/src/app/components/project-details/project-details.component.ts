import {Component, Input, SimpleChanges} from '@angular/core';
import { Project } from '../../model/project.model';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { TaskService } from 'src/app/services/task.service'; // Import TaskService


@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent {
  @Input() project: Project | null = null;
  taskName: string = '';
  taskDescription: string = '';
  isCreateTaskFormVisible: boolean = false;
  isAddMemberFormVisible:boolean=false;
  users: any[] = [];
  selectedUsers: any[] = [];
  selectedTask: any = null;
  isTaskDetailsVisible: boolean = false;
  projectId: string | null = null;
  projectUsers: any[] = [];
  projectManagers: any[] = [];
  availableSlots: number = 0;
  pendingTasks: any[] = [];
  inProgressTasks: any[] = [];
  doneTasks: any[] = [];
  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes['project'] && changes['project'].currentValue) {
      this.resetAddMemberForm();
      this.resetCreateTaskForm();
      this.loadTasks();
      this.loadUsersForProject();
    }
  }
  getAvailableSpots(): number {
    if (!this.project) {
      return 0;
    }
    return this.project.max_people - this.projectUsers.length-1;
  }

  resetAddMemberForm() {
    this.isAddMemberFormVisible = false;
    this.selectedUsers = [];
  }

  resetCreateTaskForm() {
    this.isCreateTaskFormVisible = false;
    this.taskName = '';
    this.taskDescription = '';
  }
  ngOnInit() {
    this.loadTasks();
    this.loadActiveUsers()
    if (this.project && this.project.title) {
      this.getProjectIDByTitle(this.project.title);
    }
  }
  isUserInProject(userId: string): boolean {
    return this.projectUsers.some(user => user.id === userId);
  }

  getProjectIDByTitle(title: string) {
    this.projectService.getProjectIDByTitle(title).subscribe(
      (response: any) => {
        const projectId = response?.projectId;

        if (typeof projectId === 'string') {
          console.log('Project ID:', projectId);
          if (this.project) {
            this.project.id = projectId;
            this.projectId = projectId;
            this.loadUsersForProject();
          }
        } else {
          console.error('Project ID nije string:', response);
        }
      },
      (error) => {
        console.error('Error fetching project ID:', error);
      }
    );
  }
  loadUsersForProject() {
    if (this.project && this.project.id) {
      this.projectService.getUsersForProject(this.project.id).subscribe(
        (users) => {
          this.projectUsers = this.sortUsersAlphabetically(users.filter(user => user.role.toLowerCase() === 'member'));
          this.projectManagers = this.sortUsersAlphabetically(users.filter(user => user.role.toLowerCase() === 'manager'));
          this.loadActiveUsers();
        },
        (error) => {
          console.error('Error loading users for project:', error);
        }
      );
    }
  }


  isManager(): boolean {
    return localStorage.getItem('role') === 'Manager';
  }
  loadTasks() {
    if (this.project) {
      const projectIdStr = String(this.project.id);
      this.taskService.getTasks().subscribe(tasks => {
        console.log('Fetched tasks:', tasks);

        this.pendingTasks = [];
        this.inProgressTasks = [];
        this.doneTasks = [];

        tasks.forEach(task => {
          console.log('Task structure:', task);

          if (String(task.project_id) === projectIdStr) {
            switch (task.status.toLowerCase()) {
              case 'pending':
                this.pendingTasks.push(task);
                break;
              case 'work in progress':
                this.inProgressTasks.push(task);
                break;
              case 'done':
                this.doneTasks.push(task);
                break;
              default:
                console.warn(`Unrecognized task status: ${task.status}`);
            }
          }
        });

        console.log('Pending Tasks:', this.pendingTasks);
        console.log('In Progress Tasks:', this.inProgressTasks);
        console.log('Done Tasks:', this.doneTasks);
      });
    }
  }

  loadActiveUsers() {
    this.userService.getActiveUsers().subscribe(
      (data) => {
        this.users = this.sortUsersAlphabetically(
          data.filter(user => !this.isUserInProject(user.id))
        );
      },
      (error) => {
        console.error('Error fetching active users:', error);
      }
    );
  }




  toggleSelection(user: any) {
    const index = this.selectedUsers.indexOf(user);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }
  sortUsersAlphabetically(users: any[]): any[] {
    return users.sort((a, b) => a.username.localeCompare(b.username));
  }

  addSelectedUsersToProject() {
    const project = this.project as any;
    if (project && this.selectedUsers.length > 0) {
      const userIds = this.selectedUsers.map(user => user.id);

      this.projectService.addMemberToProject(project.id, userIds).subscribe(
        (response) => {
          console.log('Users successfully added:', response);
          this.loadUsersForProject();
          this.loadActiveUsers();
          this.selectedUsers = [];
          this.availableSlots = this.getAvailableSpots();
        },
        (error) => {
          console.error('Error adding users to project:', error);
        }
      );
    } else {
      alert('No users selected.');
    }
  }

  updateTaskStatus(status: string) {
    if (this.selectedTask) {
      this.selectedTask.status = status;

      this.taskService.updateTaskStatus(this.selectedTask.id, status).subscribe(
        (response) => {
          console.log('Task status updated successfully:', response);
          this.loadTasks();
        },
        (error) => {
          console.error('Error updating task status:', error);
        }
      );
    }
  }

  showCreateTaskForm() {
    const projectId = this.project as any;
    console.log(projectId);
    this.isCreateTaskFormVisible = true;
    this.cdRef.detectChanges();
    document.querySelector('#mm')?.setAttribute("style", "display:block; opacity: 100%; margin-top: 20px");
  }

  showAddMemberToProject() {
    const project = this.project as any;
    console.log(project.id);
    this.isAddMemberFormVisible=true
    this.cdRef.detectChanges();
    document.querySelector('#addMemberModal')?.setAttribute("style", "display:block; opacity: 100%; margin-top: 20px");
  }
  addMemberToProject(user: any) {
    const project = this.project as any;
    if (project && user) {
      console.log(`Dodavanje korisnika ${user.name} u projekat ${project.name}`);

      this.projectService.addMemberToProject(project.id, user.id).subscribe(
        (response) => {
          console.log('User added to project:', response);
          this.loadActiveUsers();
          this.isAddMemberFormVisible = false;
        },
        (error) => {
          console.error('Error adding user to project:', error);
        }
      );
    }
  }

  cancelCreateTask() {
    this.isCreateTaskFormVisible = false;
    this.taskName = '';
    this.taskDescription = '';
  }
  cancelAddMember() {
    this.isAddMemberFormVisible = false;
  }


  createTask() {
    if (!this.taskName || !this.taskDescription) {
      alert('Please fill in all fields before creating the task.');
      return;
    }

    if (this.projectId) {
      const projectIdStr = String(this.projectId);
      console.log('Project ID je:', projectIdStr);

      const newTask = {
        name: this.taskName,
        description: this.taskDescription
      };

      this.projectService.createTask(projectIdStr, newTask).subscribe(
        (response) => {
          console.log('Task successfully created:', response);
          this.pendingTasks.push(response.name);
          this.loadTasks();
          this.cancelCreateTask();
        },
        (error) => {
          console.error('Error creating task:', error);
        }
      );
    } else {
      console.error('Project ID is missing');
      alert('Project ID is missing. Could not create task.');
    }
  }


  showTaskDetails(task: any) {
    console.log("Selected task:", task);
    this.selectedTask = task;
    this.isTaskDetailsVisible = true;
    this.cdRef.detectChanges();
    document.querySelector('#taskModal')?.setAttribute('style', 'display:block; opacity: 100%; margin-top:20px');

  }

  closeTaskDetails() {
    this.isTaskDetailsVisible = false;
    this.selectedTask = null;
  }


}


