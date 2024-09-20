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
  popupId: any;

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

  checkedItems: boolean[] = [];
  rejectIDS: any = [];

  toggleCheckbox(event: any, id: number): void {
    console.log(this.selectedIds, 'selected 1');
    const isChecked = event.target.checked;
    console.log(isChecked, 'isChecked');
    const index = this.selectedIds.indexOf(id);
    console.log(index, 'index');

    if (isChecked && index === -1) {
      console.log(id, 'if 1');
      this.selectedIds.push(id);
    } else if (!isChecked && index > -1) {
      this.selectedIds.splice(index, 1);
      console.log(this.selectedIds, 'else 1');
    }

    // Update the checkedItems array
    const resultIndex = this.results.findIndex((item) => item.id === id);

    console.log(resultIndex, 'resultIndex');
    if (resultIndex > -1) {
      this.checkedItems[resultIndex] = isChecked;

      console.log(this.checkedItems, 'checkedItems');
    }
    console.log('Selected IDs:', this.selectedIds);
  }

  toggleHeaderCheckbox(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isChecked = isChecked;
    this.checkedItems = new Array(this.results.length).fill(isChecked);

    if (isChecked) {
      this.selectedIds = this.results.map((item) => item.id);
    } else {
      this.selectedIds = [];
    }
    console.log('Selected IDs:', this.selectedIds);
  }

  constructor(
    private http: HttpClient,
    private alertService: AlertService,
    private router: Router
  ) {}

  allData: any[] = [];

  filterDataObj = {
    page: 0,
    size: 50,
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

  private reviewBtnUrl = baseUrl + 'review-list';
  private rejectBtnUrl = baseUrl + 'rejected';

  rejectBtnApi(): void {
    this.loading = true;
    this.loadRejectData().subscribe(
      (response) => {
        console.log('API Response:', response);
        this.results = response.data.content || [];
      },
      (error) => {
        setTimeout(() => {
          this.loading = false;
          this.alertService.showAlert('error', 'Search request failed');
          console.error('Search request failed', error);
        }, 2000);
      }
    );
  }

  private loadRejectData(): Observable<any> {
    const params = new HttpParams()
      .set('page', this.filterDataObj.page.toString())
      .set('size', this.filterDataObj.size.toString());
    return this.http.get<any>(this.rejectBtnUrl, { params }).pipe(
      catchError((error) => {
        console.error('Search request failed', error);
        return of({ data: [] }); // Return an empty result on error
      })
    );
  }

  reviewBtnApi(): void {
    this.results = [];
    this.loading = true;
    const params = new HttpParams()
      .set('page', this.filterDataObj.page.toString())
      .set('size', this.filterDataObj.size.toString());
    this.http
      .get<any>(baseUrl + 'review-list', { params })
      .subscribe((response) => {
        console.log('Review API Response:', response); // Debug statement
        this.results = response.data?.content || [];
        this.loading = false;
      });
  }

  isDialogVisible = false;
  isPopupVisible = false;

  singleselectedId: any = [];

  showPopupIcon(id: any) {
    this.singleselectedId.push(id);
    this.isDialogVisible = true;
  }

  showPopupBtn() {
    if (this.selectedIds.length === 0) {
      this.alertService.showAlert('error', 'First select the tickbox');
      return;
    } else {
      this.singleselectedId = [];
      this.isDialogVisible = true;
    }
  }

  onCancelIcon() {
    this.isDialogVisible = false;
  }

  onCancel1() {
    this.isPopupVisible = false;
  }

  // byBtn() {
  //   if (this.selectedIds.length === 0) {
  //     this.alertService.showAlert('warning', 'Please select items to reject');
  //     return;
  //   }

  //   if (!this.rejectionReason) {
  //     this.alertService.showAlert('warning', 'Please enter a rejection reason');
  //     return;
  //   }

  //   console.log('Rejecting IDs:', this.selectedIds);

  //   this.http
  //     .post<any>(baseUrl + 'rejectAll', {
  //       ids: this.selectedIds,
  //       rejectionReason: this.rejectionReason,
  //     })
  //     .subscribe(
  //       (response) => {
  //         this.alertService.showAlert(
  //           'success',
  //           'Selected entries have been rejected'
  //         );
  //         console.log('Response:', response);
  //         this.isPopupVisible = false;
  //         this.loadPendingData(); // Refresh the data after rejection
  //       },
  //       (error) => {
  //         console.error('Error:', error);
  //         this.alertService.showAlert(
  //           'error',
  //           'An error occurred while rejecting entries'
  //         );
  //       }
  //     );
  //   this.isPopupVisible = false;
  // }

  // by cross icon

 datarejected:any  
  byIcon() {  this.isDialogVisible = true;
    if (this.selectedIds.length === 0) {
      this.alertService.showAlert('warning', 'Please select an item to reject');
      return;
    }

    if (!this.rejectionReason) {
      this.alertService.showAlert('warning', 'Please enter a rejection reason');
      return;
    }
// if (this.singleselectedId===[]) {
  
// } else {
  
// }
    //   const id = this.selectedIds[0];

    //   // Create FormData object
    //   const formData = new FormData();
    //   formData.append('rejectionReason', this.rejectionReason);
    //   this.selectedIds.forEach((id) => {
    //     formData.append('ids[]', id.toString());  // Appends each id with the same name `ids[]`
    // });

    const data = {
      rejectionReason: this.rejectionReason,
      ids: this.selectedIds,
    };
    console.log(this.selectedIds);
    this.http.post(`${baseUrl}rejectAll`, data).subscribe(
      (response) => {
        this.alertService.showAlert('success', 'Entry rejected successfully.');
        console.log('Response:', response);
        // this.selectedIds = this.selectedIds.filter(
        //   (selectedId) => selectedId !== id
        // );
        this.isDialogVisible = false;
        this.loadPendingData();
        this.checkedItems = this.results.map(() => true);

        this.rejectionReason = '';
      },
      (error) => {
        console.error('Error:', error);
        this.alertService.showAlert(
          'error',
          'An error occurred while rejecting the entry.'
        );
      }
    );
    this.isDialogVisible = false;
  }

  authorizeBtn() {
    if (this.selectedIds.length === 0) {
      this.alertService.showAlert(
        'warning',
        'Please select items to authorize'
      );
      return;
    }
    console.log(this.selectedIds, 'selectedIds');

    // let ids: any = [];
    // for (const element of this.results) {
    //   ids.push(element.id);
    // }
    this.http
      .post(baseUrl + 'pending-list/authorizeAll', this.selectedIds)
      .subscribe(
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

  // rejectAllBtn() {
  //   if (this.selectedIds.length === 0) {
  //     this.alertService.showAlert('warning', 'Please select items to reject');
  //     return;
  //   }
  //   console.log(this.selectedIds, 'selectedIds');
  //   this.http.post(baseUrl + 'rejectAll', this.selectedIds).subscribe(
  //     (response) => {
  //       this.alertService.showAlert(
  //         'success',
  //         'Your Data is Verified To authorize'
  //       );
  //       console.log('Response:', response);
  //     },
  //     (error) => {
  //       console.error('Error:', error);
  //     }
  //   );
  // }

  rightIconApi(event: MouseEvent, id: number) {
    this.http.post(baseUrl + 'pending-list/authorize/' + id, null).subscribe(
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
