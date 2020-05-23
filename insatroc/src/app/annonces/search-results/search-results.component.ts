import { Component, OnInit } from '@angular/core';
import { PostModel } from '../post_model';
import {HttpService } from '../../http.service';
import {Router, ActivatedRoute} from "@angular/router";
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  Annonces : PostModel[] = [];
  AnnoncesOriginales :PostModel[]= [];
  min;
  max;
  selected=[];
  maxprice = 0;
  tri = "populaire";
  annoncesFiltrees = this.Annonces.length;
  activeImage = null;

  para = 0;
  npages = 30;
  NbPostsPerPage = 10;
  pageIndex = 0;

  constructor(public httpService:HttpService,private router :Router, private route: ActivatedRoute) { }

  log (status) {
    console.log(status)
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.Annonces = this.httpService.getSearchResult(params.arg).posts;
      this.AnnoncesOriginales = this.Annonces;
      console.log("this.post");
      console.log(this.Annonces);
    })
  }

  pageChanged (event : PageEvent){
    console.log(event);
    this.pageIndex = event.pageIndex;
    this.NbPostsPerPage = event.pageSize;
  }

  onDisplayPost(id){
    for (let k=0 ; k<this.Annonces.length;k++){
      if(id == this.Annonces[k]._id){
        console.log("indeed");
        this.router.navigate(['/annonce'],{queryParams:{bid:id as string}});
      }
    }
  }

  getAnnonces(){
    this.min = this.AnnoncesOriginales[0].price;
    this.max = this.min;
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
      // Filtrage par catégorie
      if((this.selected.length==0 || this.selected.some((val) => annonce.category.includes(val)))
       && (this.maxprice==this.min || this.maxprice==0 || annonce.price <= this.maxprice)){
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

}


