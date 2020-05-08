import { AbstractControl } from "@angular/forms";
import { Observable, Observer } from "rxjs";

export function ValidateUrl(control: AbstractControl) {
    if (!control.value.startsWith('https') || !control.value.includes('.io')) {
      return { chocoponte: true };
    }
    return null;
  }


export function imageValidator (control : AbstractControl) {
  const fileArray = control.value as ArrayBuffer;
  const arr =  new Uint8Array(fileArray).subarray(0,4);
  let header = '';
  for (let i = 0; i < arr.length; i++) {
    header += arr[i].toString(16).toUpperCase();
  }
  let Validity : Boolean = false;
  switch(header) {
    case "89504E47": //png signatures else jpg , canon etc 
    case "FFD8FFE0":
    case "FFD8FFE2":
    case "FFD8DDE8":
    case "FFD8FFE1":
      Validity = true;
      console.log(16);
      break;
    default:
      Validity = false;
      break;
  }
  if(Validity){
    return {chocoloco: null}
  }else{
    return {chocoloco:{
      reason:'Invalide MIME type',
      value: header
    }}
  }
  //filereader.readAsArrayBuffer(control.value);

  return {chocoloco: null};

}