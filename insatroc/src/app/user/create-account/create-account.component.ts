import { Component, OnInit } from '@angular/core';
import {NgForm, FormControl, Validators, FormGroup} from '@angular/forms';
import {HttpService } from '../../http.service';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  form: FormGroup;
  hide = true;
  error = false;
  selected1;
  selected2;
  secretQuestions = ["Quel est le nom de jeune fille de votre mère ?",
  "Quel était le nom de votre premier animal de companie ?",
  "En quelle année est né votre grand-père maternel ?",
  "Dans quel département êtes-vous né ?",
  "Quel est le deuxième prénom de votre père ?",
  "Quel est votre film préféré ?"];
  private authSub : Subscription;


  constructor(public httpService:HttpService, private authService: AuthService, private router: Router) { }

  Register(form: FormGroup){
    var questionID1 = this.secretQuestions.indexOf(form.value.question1);
    var questionID2 = this.secretQuestions.indexOf(form.value.question2);
    this.authService.register(form.value.first_name, form.value.last_name, form.value.username, form.value.email, form.value.password, questionID1, form.value.answer1, questionID2, form.value.answer2);
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      first_name: new FormControl(),
      last_name: new FormControl(),
      username: new FormControl(),
      email: new FormControl('', [Validators.email]),
      password: new FormControl('', []),
      question1: new FormControl('', []),
      answer1: new FormControl('', []),
      question2: new FormControl('', []),
      answer2: new FormControl('', []),
    })
    this.authSub=this.authService.onAuthUpdate().subscribe(
      (res)=>{
        if(!res){
          this.error=true;
          this.form.patchValue({
            username:'',
            email:'',
            password:''
          })
        }
      }
    )
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.authSub.unsubscribe();
  }

}
