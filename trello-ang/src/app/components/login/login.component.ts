import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import { User } from '../../model/user.model';
import {UserService} from "../../services/user.service";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  imagePath: string = 'assets/loginSlika.svg';
  resetEmail: string = '';
  resetMessage: string = '';
  username: string = '';
  password: string = '';
  loginError: string = '';
  email: string='';
  resetMessageMagic:string='';
  user: User = new User('', '', '', '', '', '','');
  constructor(private router: Router, private authService: AuthService,private userService:UserService) {}

  login() {
    if (this.username && this.password) {
      const userCredentials = { username: this.username, password: this.password };

      this.authService.login(userCredentials).subscribe(
        (response) => {
          const { access_token, role,user_id } = response;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('role', role);
          localStorage.setItem('user_id',user_id.toString());
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          this.loginError = 'Invalid username or password. Please try again.';
        }
      );
    } else {
      this.loginError = 'Please enter both username and password.';
    }
  }


  navigateToRegister() {
    this.router.navigate(['/register']);
  }
  isEmailValid(email: string): boolean {
    return email.endsWith('@gmail.com');
  }
  checkEmailAndResetPassword() {
    if (!this.resetEmail) {
      this.resetMessage = 'Email must be filled out.';
      return;
    }
    if (!this.isEmailValid(this.resetEmail)) {
      this.resetMessage = 'Email must be in @gmail.com format';
      return;
    }

    this.userService.checkUserActive(this.resetEmail).subscribe(
      (response) => {
        if (response.active) {
          this.userService.requestPasswordReset(this.resetEmail).subscribe(
            () => {
              this.resetMessage = 'A password reset link has been sent to your email address.';
            },
            (error) => {
              this.resetMessage = 'There was an error sending the password reset link. Try again.';
            }
          );
        } else {
          this.resetMessage = 'Email is not active.';
        }
      },
      (error) => {
        this.resetMessage = 'An error occurred while checking the user\'s status.';
      }
    );
  }
  checkEmailAndUsernameAndSendMagicLink() {
    console.log("Email koji je unet:", this.email);
    console.log("Username koji je unet:", this.username);

    if (!this.email || !this.username) {
      this.resetMessageMagic = 'Email i Username moraju biti uneti.';
      return;
    }

    this.userService.loginWithMagic(this.email, this.username).subscribe(
      (response) => {
        console.log('Odgovor sa servera:', response);
        this.resetMessageMagic = response.message;
      },
      (error) => {
        console.error('Greška pri slanju magic linka:', error);
        this.resetMessageMagic = 'Desila se greška pri slanju magic linka.';
      }
    );
  }


}
