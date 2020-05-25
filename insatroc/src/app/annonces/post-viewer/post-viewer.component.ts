import { Component, OnInit } from '@angular/core';
import { PostModel } from '../post_model';
import {HttpService } from '../../http.service'
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-post-viewer',
  templateUrl: './post-viewer.component.html',
  styleUrls: ['./post-viewer.component.css']
})
export class PostViewerComponent implements OnInit {
  posts : PostModel[] = [];
  AnnoncesV :PostModel[] = [{_id: null, title: "Vends un sac ", description: "je vends un sac pour venir sac si sac alors sac sac", category: ["Autres"], price: 50, urls: ['../../../assets/images/sac.jpg','../../../assets/images/coloredpencils.jpg','../../../assets/images/pileofcolorpencils.jpg'], date: new Date(), views: 30, username: "Pénélope"},
                           {_id: null, title: "Vends un sac de couchage ", description: "je vends un sac de couchage , trs inconfortable mais c'est mieux que rien", category: ["Loisirs/Sport", "Bureau"], price: 10, urls: ['../../../assets/images/sac.jpg','../../../assets/images/coloredpencils.jpg'], date: new Date(), views: 15, username: "user1"}];
  AnnoncesOriginales :PostModel[]= [];
  Annonces: PostModel[] = [];
  private postsSub : Subscription;
  private imagesSub : Subscription;

  sidetoggle = false;
  min: number;
  max: number;
  selected=[];
  maxprice=0;
  tri = "populaire";
  annoncesFiltrees = this.Annonces.length;

  activeImage = null;

  para = 0;
  npages = 30;
  NbPostsPerPage = 10;
  pageIndex = 0;



  constructor(public httpservice: HttpService, private router:Router) {}

  ngOnInit(): void {
    this.httpservice.getAllPosts();
    this.postsSub = this.httpservice.onPostsUpdate().subscribe(
      (res)=>{
        this.AnnoncesOriginales=res;
        for(let k=0 ;k<res.length;k++){
          this.httpservice.getPostsImages(res[k]._id);
        }
      }
    )
    this.imagesSub = this.httpservice.onImagesUpdate().subscribe(
      (res)=>{
        for(let k=0;k<this.AnnoncesOriginales.length;k++){
          if(this.AnnoncesOriginales[k]._id == Object.keys(res)[0]){
            this.AnnoncesOriginales[k].urls=res[this.AnnoncesOriginales[k]._id];
          }
        }
        this.Annonces = this.AnnoncesOriginales;
        this.min = this.AnnoncesOriginales[0].price;
        this.max = this.min;
      }
    )
    for(let k= 0; k<this.AnnoncesOriginales.length;k++){
      this.httpservice.getPostsImages(this.AnnoncesOriginales[k]._id);
    }
    this.httpservice.getPostsImages(1);
  }

  log (status) {
    console.log(status)
  }

  // slideIt(i,seq:number){
  //   let f = this.Annonces[i].urls.length;
  //   if(seq == 1 ){
  //     (document.getElementsByClassName('image'+i)[0] as HTMLImageElement).src=this.Annonces[i].urls[1];
  //     this.Annonces[i].urls.push(this.Annonces[i].urls[0]);
  //     this.Annonces[i].urls.shift();
  //     console.log(this.Annonces[i].urls)
  //   }else{
  //     this.Annonces[i].urls.unshift(this.Annonces[i].urls[f-1]);
  //     this.Annonces[i].urls.pop();
  //     (document.getElementsByClassName('image'+i)[0] as HTMLImageElement).src=this.Annonces[i].urls[0];
  //     console.log(this.Annonces[i].urls)
  //   }
  // }

  pageChanged (event : PageEvent){
    this.pageIndex = event.pageIndex;
    this.NbPostsPerPage = event.pageSize;
  }

// Redirection vers une annonce quand on clique dessus
  onDisplayPost(id){
    for (let k=0 ; k<this.Annonces.length;k++){
      if(id == this.Annonces[k]._id){
        this.router.navigate(['/annonce'],{queryParams:{bid:id as string}});
      }
    }
  }



// Filtrage et Tri

  getAnnonces(){
    for(let annonce of this.AnnoncesOriginales){
      if(annonce.price > this.max){
        this.max = annonce.price;
      }
      if(annonce.price < this.min){
        this.min = annonce.price;
      }
    }
    this.Filtrer();
    this.Trier();
    return this.Annonces;
  }

  Filtrer(){
    var annoncesFiltrees2: PostModel[] = [];
    for(let annonce of this.AnnoncesOriginales){
      if((this.selected.length==0 || this.selected.some((val) => annonce.category.includes(val)))
       && (this.maxprice==0 || annonce.price <= this.maxprice)){
        annoncesFiltrees2.push(annonce);
      }
    }
    this.Annonces = annoncesFiltrees2;
    this.annoncesFiltrees = this.Annonces.length;
  }

  Trier(){
    if(this.tri=="prix-croissant"){
      this.SortByIncreasingPrice();
    }
    if(this.tri=="prix-decroissant"){
      this.SortByDecreasingPrice();
    }
    if(this.tri=="date"){
      this.SortByDate();
    }
    if(this.tri=="populaire"){
      this.SortByNbViews();
    }
  }

  SortByIncreasingPrice(){
    var annoncesTriees: PostModel[] = this.Annonces.sort((n1, n2) => {
      if(n1.price > n2.price){
        return 1;
      }
      if(n1.price < n2.price){
        return -1;
      }
      return 0;
    });
    this.Annonces = annoncesTriees;
  }

  SortByDecreasingPrice(){
    var annoncesTriees: PostModel[] = this.Annonces.sort((n1, n2) => {
      if(n1.price < n2.price){
        return 1;
      }
      if(n1.price > n2.price){
        return -1;
      }
      return 0;
    });
    this.Annonces = annoncesTriees;
  }

  SortByDate(){
    var annoncesTriees: PostModel[] = this.Annonces.sort((n1, n2) => {
      if(n1.date < n2.date){
        return 1;
      }
      if(n1.date > n2.date){
        return -1;
      }
      return 0;
    });
    this.Annonces = annoncesTriees;
  }

  SortByNbViews(){
    var annoncesTriees: PostModel[] = this.Annonces.sort((n1, n2) => {
      if(n1.views < n2.views){
        return 1;
      }
      if(n1.views > n2.views){
        return -1;
      }
      return 0;
    });
    this.Annonces = annoncesTriees;
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log("component postviewer destroyed");
    this.postsSub.unsubscribe();
    this.imagesSub.unsubscribe();
  }
}
