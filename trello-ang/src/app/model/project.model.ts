export class Project {
  id?: string;
  title: string;
  description: string;
  expected_end_date: string;
  min_people: number;
  max_people: number;
  users: any[];

  constructor() {
    this.id='';
    this.title = '';
    this.description = '';
    this.expected_end_date = '';
    this.min_people = 0;
    this.max_people = 0;
    this.users = [];
  }


}
