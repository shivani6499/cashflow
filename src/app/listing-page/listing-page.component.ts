import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { baseUrl } from 'src/app/utils/api';
import { Router } from '@angular/router';
import { AlertService } from '../utils/aleartService';

@Component({
  selector: 'app-listing-page',
  templateUrl: './listing-page.component.html',
  styleUrls: ['./listing-page.component.css'],
})
export class ListingPageComponent implements OnInit {
  loading: boolean = false;
  error: string | null = null;
  cancelIcon = baseUrl + 'pending-list/reject/';
  rejectPost = baseUrl + 'rejectAll';
  selectedId: number[] = [];
  selectedIds: number[] = [];
  rejectionReason: string = '';
  tickBoxClick: boolean = true;
  isChecked: boolean = false;
  showAdditionalColumns: boolean = false;
  tickBox: boolean = false;
  rejectAll: boolean = false;
  authorizeAll: boolean = false;
  hideOnlyPending: boolean = false;
  showOnlyPending: boolean = false;
  results: any[] = [];
  data: any[] = [];
  selectedOption: number = 0;
  searchValue: string = '';
  currentStatus: 'rejected' | 'pending' | 'review' | null = null;
  isLoading = true;

  ngOnInit() {
    this.loadPendingData();
    this.checkedItems = this.results.map(() => true);
  }

  onOptionChange() {
    console.log('Selected option:', this.selectedOption);
  }

  setStatus(status: 'rejected' | 'pending' | 'review') {
    this.currentStatus = status;
    console.log(`Status set to: ${status}`);
  }

  searchParam = '';
  search() {
    this.loading = true;
    this.error = null;

    if (!this.currentStatus) {
      this.alertService.showAlert(
        'Error',
        'Please select Any One Of This Reject, Pending, or Review first'
      );
      console.log('Please select Reject, Pending, or Review first');
      this.loading = false;
      return;
    }

    // if (!this.searchValue) {
    //   console.log('Please enter a search value');
    //   this.loading = false;
    //   return;
    // }
    if (!this.searchValue || this.searchValue.trim() === '') {
      this.alertService.showAlert('error', 'Enter the Search Value First');
      this.loading = false;
      return; // Early return to prevent further execution
    }
    this.loading = true;
    console.log(this.selectedOption, 'this.selectedOption');
    console.log(this.searchValue, 'this.searchValue');

    let apiUrl = '';
    switch (this.selectedOption * 1) {
      case 0:
        this.searchParam = 'referenceNo';
        break;
      case 1:
        this.searchParam = 'corporateCode';
        break;
      case 2:
        this.searchParam = 'corporateName';
        break;
      case 3:
        this.searchParam = 'forecastingAs';
        break;
      case 4:
        this.searchParam = 'entryType';
        break;
      default:
        this.searchParam = 'referenceNo';
    }

    console.log(this.searchParam, 'this.searchParam11  ');

    if (this.currentStatus === 'rejected') {
      apiUrl =
        baseUrl +
        'rejected/search?' +
        this.searchParam +
        '=' +
        this.searchValue;
    }
    if (this.currentStatus === 'pending') {
      console.log(this.searchParam, 'this.searchParam222');
      apiUrl =
        baseUrl +
        'pending-list/search?' +
        this.searchParam +
        '=' +
        this.searchValue;
    }
    if (this.currentStatus === 'review') {
      apiUrl =
        baseUrl +
        'review-list/search?' +
        this.searchParam +
        '=' +
        this.searchValue;
    }
    apiUrl + '&page=0&size=2';

    console.log(apiUrl, 'apiUrl');

    this.http.get(apiUrl).subscribe(
      (response: any) => {
        this.loading = false;
        console.log('Search results:', response);
        if (response.code === 200 && response.data && response.data.content) {
          this.results = response.data.content;
        } else {
          this.alertService.showAlert('Error', 'Data Not Found');
          console.error(
            'No data found or error in response:',
            response.message
          );
          this.results = [];
        }
      },
      (error) => {
        this.loading = false;
        console.error('Error occurred during search:', error);
        this.results = [];
      }
    );
  }

  //

  navigateToEdit(id: number) {
    console.log('shivani');
    // Navigate to the manual-four-row page with the result ID
    this.router.navigate(['/edit-entry', id]);
    console.log(this.router, 'aaaaaaaaaaaaaaa');
  }

  // button
  rejectBtn() {
    this.results = [];
    this.showOnlyPending = false;
    this.hideOnlyPending = true;
    this.rejectAll = false;
    this.showAdditionalColumns = false;
    this.authorizeAll = false;
    console.log(this.selectedOption, 'selectedOption');
    this.rejectBtnApi();
    this.setStatus('rejected');
    this.showAdditionalColumns = true;
    this.tickBox = false;
    console.log('Flag value:', this.showAdditionalColumns);
  }

  reviewBtn() {
    this.results = [];
    this.showOnlyPending = false;
    this.hideOnlyPending = true;
    this.showAdditionalColumns = false;
    this.tickBox = false;
    this.rejectAll = false;
    this.authorizeAll = false;
    console.log(this.selectedOption, 'selectedOption');
    this.reviewBtnApi();
    this.setStatus('review');
  }

  pendingBtn() {
    this.results = [];
    console.log(this.selectedOption, 'selectedOption');
    this.loadPendingData();
    this.showOnlyPending = true;
    this.hideOnlyPending = false;
    this.showAdditionalColumns = false;
    this.setStatus('pending');
  }

  checkedItems: boolean[] = []; // Array to store the checked status of individual checkboxes
  rejectIDS: any = [];
  fetchResults() {
    this.http.get<any[]>('your-api-endpoint').subscribe((data) => {
      this.results = data;
      this.checkedItems = new Array(data.length).fill(false); // Initialize checkbox states
    });
  }

  toggleCheckbox(event: any, id: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    console.log(
      `Checkbox ${isChecked ? 'checked' : 'unchecked'} for ID: ${id}`
    );
    if (isChecked) {
      this.selectedIds.push(id);
    } else {
      const index = this.selectedIds.indexOf(id);
      if (index > -1) {
        this.selectedIds.splice(index, 1);
      }
    }
    if (event.target.checked) {
      // Add the ID to the selectedIds array if checkbox is checked
      this.selectedIds.push(id);
    } else {
      // Remove the ID from the array if checkbox is unchecked
      this.selectedIds = this.selectedIds.filter(
        (selectedId) => selectedId !== id
      );
    }
  }

  toggleHeaderCheckbox(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isChecked = isChecked;
    this.checkedItems = new Array(this.results.length).fill(isChecked);
    // Update selectedId based on the checkbox state
    if (isChecked) {
      this.selectedId = this.results.map((item) => item.id);
    } else {
      this.selectedId = [];
    }
  }

  // Initialize the checkedItems array based on the length of results

  constructor(
    private http: HttpClient,
    private alertService: AlertService,
    private router: Router
  ) {}

  allData: any[] = [];

  // pendingBtnUrl(): void {
  //   this.results = [];
  //   this.http.get<any>(baseUrl + 'pending-list').subscribe({
  //     next: (result) => {
  //       if (result && result.data && result.data.content) {
  //         this.results = result.data.content; // Adjust according to the actual response structure
  //       } else {
  //         console.error('Unexpected API response structure', result);
  //       }
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       // this.loading = true;
  //       console.error('Error fetching data', error);

  //       this.isLoading = false;
  //     },
  //   });
  // }

  filterDataObj = {
    page: 0,
    size: 4,
  };
  onPrevious() {
    if (this.filterDataObj.page > 0) {
      this.filterDataObj.page--;
      this.loadPendingData();
      this.reviewBtnApi();
      this.rejectBtn();
    }
  }
  onNext() {
    this.filterDataObj.page++;
    this.loadPendingData();
    this.reviewBtnApi();
    this.rejectBtn();
  }

  // loadPendingData() {
  //   this.results = [];
  //   this.tickBox = true;
  //   this.rejectAll = true;
  //   this.authorizeAll = true;
  //   this.isLoading = true;
  //   this.showOnlyPending = true;
  //   this.hideOnlyPending = false;
  //   this.showAdditionalColumns = false;
  //   this.setStatus('pending');

  //   this.http.get<any>(`${baseUrl}pending-list?size=50`).subscribe({
  //     next: (response) => {
  //       console.log('API Response:', response); // Debug statement
  //       if (response && response.data && response.data.content) {
  //         this.results = response.data.content;
  //         this.checkedItems = new Array(this.results.length).fill(false);
  //       } else {
  //         console.error('Unexpected API response structure', response);
  //         this.alertService.showAlert('error', 'Unexpected data structure');
  //       }
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching data', error);
  //       this.isLoading = false;
  //       this.alertService.showAlert('error', 'No Data Found');
  //     },
  //   });
  // }

  loadPendingData() {
    this.results = [];
    this.tickBox = true;
    this.rejectAll = true;
    this.authorizeAll = true;
    this.isLoading = true;
    this.showOnlyPending = true;
    this.hideOnlyPending = false;
    this.showAdditionalColumns = false;
    this.setStatus('pending');
    const params = new HttpParams()
      .set('page', this.filterDataObj.page.toString())
      .set('size', this.filterDataObj.size.toString());
    this.http.get<any>(baseUrl + 'pending-list', { params }).subscribe({
      next: (response) => {
        console.log('API Response:', response); // Debug statement
        if (response && response.data && response.data.content) {
          this.results = response.data.content;
          this.checkedItems = new Array(this.results.length).fill(false);
        } else {
          console.error('Unexpected API response structure', response);
          this.alertService.showAlert('error', 'NO ENTRY FOUND');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.isLoading = false;
        this.alertService.showAlert('error', 'No Data Found');
      },
    });
  }

  id: number = 0;
  view(event: MouseEvent, id: number) {
    console.log(`View button clicked for ID: ${id}`);
    this.router.navigate(['/review', id]);
  }

  // manual show the pending url

  // url for api
  // private pendingBtnUrls = baseUrl + 'pending-list' + '?size=50';
  private reviewBtnUrl = baseUrl + 'review-list';
  private rejectBtnUrl = baseUrl + 'rejected';

  // pendingBtnApi(): void {
  //   this.results = [];
  //   this.loading = true;
  //   this.loadPendingData().subscribe(
  //     (response) => {
  //       console.log('API Response:', response); // Debug statement
  //       this.results = response.data.content || []; // Ensure data structure is correct
  //     },
  //     (error) => {
  //       this.loading = false;
  //       this.alertService.showAlert('error', 'No Data Found');
  //       console.error('Search request failed', error);
  //     }
  //   );
  // }

  rejectBtnApi(): void {
    // this.results = [];
    this.loading = true;
    this.loadRejectData().subscribe(
      (response) => {
        console.log('API Response:', response); // Debug statement
        this.results = response.data.content || []; // Ensure data structure is correct
      },
      (error) => {
        this.loading = false;
        this.alertService.showAlert('error', 'Search request failed');
        console.error('Search request failed', error);
      }
    );
  }

  private loadRejectData(): Observable<any> {
    const params = new HttpParams()
    .set('page', this.filterDataObj.page.toString())
    .set('size', this.filterDataObj.size.toString());
    return this.http.get<any>(this.rejectBtnUrl , {params}).pipe(
      catchError((error) => {
        console.error('Search request failed', error);
        return of({ data: [] }); // Return an empty result on error
      })
    );
  }

  // reviewBtnApi(): void {
  //   this.results = [];
  //   this.loading = true;
  //   this.loadReviewData().subscribe(
  //     (response) => {
  //       console.log('Review API Response:', response); // Debug statement
  //       this.results = response.data.content || []; // Ensure data structure is correct
  //     },
  //     (error) => {
  //       this.loading = false;
  //       this.alertService.showAlert('error', 'No Data Found');
  //       console.error('Review request failed', error);
  //     }
  //   );
  // }

  // private loadPendingData(): Observable<any> {
  //   return this.http.get<any>(this.pendingBtnUrls).pipe(
  //     catchError((error) => {
  //       console.error('Pending request failed', error);
  //       return of({ data: [] }); // Return an empty result on error
  //     })
  //   );
  // }

  reviewBtnApi(): void {
    this.results = [];
    this.loading = true;
    const params = new HttpParams()
      .set('page', this.filterDataObj.page.toString())
      .set('size', this.filterDataObj.size.toString());
    this.http.get<any>(baseUrl + 'review-list' , { params }).subscribe((response) => {
      console.log('Review API Response:', response); // Debug statement
      this.results = response.data?.content || [];
      this.loading = false;
    });
  }
  // private loadReviewData(): Observable<any> {
  //   return this.http.get<any>(this.reviewBtnUrl).pipe(
  //     catchError((error) => {
  //       return of({ data: [] });
  //     })
  //   );
  // }

  // popyp rejectAllbtn api
  isPopupVisible = false;
  isDialogVisible = false;
  editPopUpVisible = false;

  showPopup() {
    if (!this.selectedId || this.selectedId.length === 0) {
      this.alertService.showAlert('error', 'First select the tickbox');
      return;
    }
    this.isPopupVisible = true;
  }
  showPopup1(id: any) {
    if (this.selectedIds.length === 0) {
      this.alertService.showAlert('error', 'First select the tickbox');
      return;
    }
    this.isPopupVisible = true;
  }

  onCancel() {
    this.isPopupVisible = false;
  }

  onCancel1() {
    this.isPopupVisible = false;
  }

  cancle2() {
    this.isDialogVisible = false;
  }

  onConfirm1() {
    this.isPopupVisible = true;
    let ids: any = [];

    for (const element of this.results) {
      ids.push(element.id);
    }
    this.http
      .post<any>(this.rejectPost, {
        ids: ids,
        rejectionReason: this.rejectionReason,
      })
      .subscribe(
        (response) => {
          this.alertService.showAlert(
            'success',
            'Your Data is Verified To Reject'
          );
          console.log('Response:', response);
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }

  onConfirm() {
    let ids: any = [];
    for (const element of this.results) {
      ids.push(element.id);
    }
    this.isPopupVisible = true;
    // api
    this.http
      .post<any>(this.rejectPost, {
        ids,
        rejectionReason: this.rejectionReason,
      })
      .subscribe(
        (response) => {
          this.alertService.showAlert(
            'success',
            'Your Data is Verified To Reject'
          );
          console.log('Response:', response);
        },
        (error) => {
          console.error('Error:', error);
        }
      );
    this.isPopupVisible = false;
  }

  authorizeBtn() {
    if (!this.selectedId || this.selectedId.length === 0) {
      this.alertService.showAlert('error', 'First select the tickbox');
      return;
    }
    let ids: any = [];
    for (const element of this.results) {
      ids.push(element.id);
    }
    this.http.post(baseUrl + 'pending-list/authorizeAll', ids).subscribe(
      (response) => {
        this.alertService.showAlert(
          'success',
          'Your Data is Verified To authorize'
        );
        console.log('Response:', response);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  rightIconApi() {
    if (this.selectedIds.length === 0) {
      this.alertService.showAlert('error', 'First select the tickbox');
      return;
    }
    let ids: any = [];

    for (const element of this.results) {
      ids.push(element.id);
    }
    this.http.post(baseUrl + 'pending-list/authorize/' + ids, null).subscribe(
      (response) => {
        this.alertService.showAlert('success', 'Your Data is Ready To Review');
        console.log('Response:', response);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }
}
