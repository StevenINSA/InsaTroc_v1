import { Component, OnInit } from '@angular/core';
import { PostModel } from '../post_model';
import {HttpService } from '../../http.service'
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';


@Component({
  selector: 'app-post-viewer',
  templateUrl: './post-viewer.component.html',
  styleUrls: ['./post-viewer.component.css']
})
export class PostViewerComponent implements OnInit {
  posts : PostModel[] = [];
  sidetoggle = false;
  min = 0;
  max = 300;
  selected=[];
  maxprice=0;


  AnnoncesV :PostModel[] = [{_id: null, title: "Vends un sac ", description: "je vends un sac pour venir sac si sac alors sac sac", category: ["Autres"], price: 50, urls: ['../../../assets/images/sac.jpg','../../../assets/images/coloredpencils.jpg','../../../assets/images/pileofcolorpencils.jpg'], date: new Date(), views: 30, username: "Pénélope"},
                           {_id: null, title: "Vends un sac de couchage ", description: "je vends un sac de couchage , trs inconfortable mais c'est mieux que rien", category: ["Loisirs/Sport", "Bureau"], price: 10, urls: ['../../../assets/images/sac.jpg','../../../assets/images/coloredpencils.jpg'], date: new Date(), views: 15, username: "user1"}
  ]
  Annonces :PostModel[]= [];
  annoncesFiltrees = this.Annonces.length;
  activeImage = null;
  para = 0;
  npages = 30;
  pPerPages = 10;



  constructor(public httpservice: HttpService, private router:Router) { }

  log (status) {
    console.log(status)
  }

  ngOnInit(): void {
    console.log(this.selected)
    console.log(this.maxprice)
    this.Annonces = this.httpservice.getAllPosts();
    console.log(this.Annonces);
  }

  AddAnnounce(annonce : PostModel){}
  slideIt(i,seq:number){
    //let doc = document.getElementsByClassName('image'+i);
    //for(let b = 1;b< doc.length;b++ ){
      //(doc[b] as HTMLElement).style.display='n'
    //}
    //console.log(i);
    //console.log((document.getElementsByClassName('image'+i)[0] as HTMLElement).style.display);
    //(document.getElementsByClassName('image'+i)[0] as HTMLElement).style.display='none';
    let f = this.Annonces[i].urls.length;
    if(seq == 1 ){
      (document.getElementsByClassName('image'+i)[0] as HTMLImageElement).src=this.Annonces[i].urls[1];
      this.Annonces[i].urls.push(this.Annonces[i].urls[0]);
      this.Annonces[i].urls.shift();
      console.log(this.Annonces[i].urls)
    }else{
      this.Annonces[i].urls.unshift(this.Annonces[i].urls[f-1]);
      this.Annonces[i].urls.pop();
      (document.getElementsByClassName('image'+i)[0] as HTMLImageElement).src=this.Annonces[i].urls[0];
      console.log(this.Annonces[i].urls)
    }

  }
  pageChanged (event : PageEvent){
    console.log(event);
  }
  onDisplayPost(id){
    for (let k=0 ; k<this.Annonces.length;k++){
      if(id == this.Annonces[k]._id){
        console.log("indeed");
        this.router.navigate(['/annonce'],{queryParams:{bid:id as string}});
      }
    }
  }


  PostInFilteredCategory(annonce: PostModel){
    return(this.selected.some((val) => annonce.category.includes(val)));
  }

  ResetFiltrage(){
    this.annoncesFiltrees = 0;
  }
  Filtrage(){
    this.annoncesFiltrees +=1;
  }
}
