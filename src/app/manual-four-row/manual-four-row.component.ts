import {
  Component,
  OnInit,
  AfterViewInit,
  Renderer2,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { AlertService } from '../utils/aleartService';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { baseUrl } from '../utils/api';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-manual-four-row',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgFor,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
  ],
  templateUrl: './manual-four-row.component.html',
  styleUrls: ['./manual-four-row.component.css'],
})
export class ManualFourRowComponent implements OnInit, AfterViewInit {
  forecastForm!: FormGroup;

  private apiUrl = baseUrl + 'forecasts';

  corporateCode: string = '';
  corporateName: string = '';
  forecastingAs: string = '';
  entryType: string = '';
  narration: string = '';
  description: string = '';
  mode: string = '';
  beneficiaryPayers: string = '';
  // accountType: string = '';
  accountNumber: string = '';
  forecastedAmount: number = 0;
  currency: string = 'INR';
  lockRecord: boolean = true;
  valueDate: string = '';
  recurringFrom: string = '';
  recurringTo: string = '';
  // today: any;
  recurrencePattern: string = '';
  searchbyTxt: any;
  accountTypes: any[] = [];
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  searchBy: string = 'corporateCode';
  apiAllUrl = baseUrl + 'corporate/all';
  today: string = new Date().toISOString().split('T')[0];
  updateRecurringOptions() {
    const fromDateValue = this.formData.recurringFrom;
    const toDateValue = this.formData.recurringTo;

    if (fromDateValue && toDateValue) {
      const fromDate = new Date(fromDateValue);
      const toDate = new Date(toDateValue);
      const timeDiff = toDate.getTime() - fromDate.getTime();
      const dayDiff = timeDiff / (1000 * 60 * 60 * 24); // Calculate the difference in days
      const maxDays = 180; // 6 months or approximately 180 days

      // Check if the selected date range exceeds 6 months
      if (dayDiff > maxDays) {
        alert(
          'The selected date range exceeds 6 months. Please choose a valid range.'
        );
        this.formData.recurringTo = ''; // Reset the 'To' date
        this.recurringOptions = []; // Reset recurring options
        return;
      }

      this.recurringOptions = []; // Reset recurring options

      // If the dates are the same, allow only 'Daily'
      if (dayDiff === 0) {
        this.recurringOptions.push('Daily');
      }
      // If the date difference is exactly 1 day, show 'Daily' and 'Weekly'
      else if (dayDiff === 1) {
        this.recurringOptions.push('Daily');
      }
      // If the date difference is more than 1 day but less than 7 days, allow 'Daily' and 'Weekly'
      else if (dayDiff > 1 && dayDiff < 7) {
        this.recurringOptions.push('Daily', 'Weekly');
      }
      // If the date difference is 7 days or more but less than 30 days, allow only 'Weekly'
      else if (dayDiff >= 7 && dayDiff < 30) {
        this.recurringOptions.push('Weekly');
      }
      // If the date difference is 30 days or more, allow 'Daily', 'Weekly', and 'Monthly'
      else if (dayDiff >= 30) {
        this.recurringOptions.push('Daily', 'Weekly', 'Monthly');
      }
    } else {
      this.recurringOptions = []; // Reset options if no valid date range is selected
    }
  }

  accountOptions = {
    internalAccount: [
      { value: 'internalAcc001', text: 'Internal Acc 001' },
      { value: 'internalAcc002', text: 'Internal Acc 002' },
    ],
    externalAccount: [
      { value: 'externalAcc001', text: 'External Acc 001' },
      { value: 'externalAcc002', text: 'External Acc 002' },
    ],
  };
  // Define the mode options
  modeOptions = {
    inwardPayment: [
      { value: 'accountDeposit', text: 'Account Deposit' },
      { value: 'cash', text: 'Cash' },
    ],
    outwardPayment: [
      { value: 'accountWithdrawal', text: 'Account Withdrawal' },
      { value: 'cash', text: 'Cash' },
    ],
  };

  modeOptionsList: { value: string; text: string }[] = [];
  onForecastingAsChange(event: any): void {
    const selectedForecastingAs = event.target.value;
    if (selectedForecastingAs === 'Inward Payment') {
      this.modeOptionsList = this.modeOptions.inwardPayment;
    } else if (selectedForecastingAs === 'Outward Payment') {
      this.modeOptionsList = this.modeOptions.outwardPayment;
    } else {
      this.modeOptionsList = [];
    }
  }

  @ViewChild('entryType', { static: false })
  entryTypeSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('accountType', { static: false })
  accountTypeSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('accountNumber', { static: false })
  accountNumberSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('forecastingAs', { static: false })
  forecastingAsSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('mode', { static: false })
  modeSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('searchBy', { static: false })
  searchBySelect!: ElementRef<HTMLSelectElement>;

  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private alertService: AlertService
  ) {}

  formData = {
    corporateCode: '',
    corporateName: '',
    forecastingAs: '',
    forecastCurrency: 'INR',
    entryType: '',
    narration: '',
    description: '',
    mode: '',
    beneficiaryPayers: '',
    accountType: '',
    accountNumber: '',
    forecastedAmount: '',
    lockRecord: false,
    valueDate: '',
    recurringFrom: '',
    recurringTo: '',
    recurrencePattern: '',
  };
  isOneTime = false;
  isRecurring = false;
  recurringOptions = ['Daily', 'Weekly', 'Monthly']; // Example options

  toggleFields() {
    this.isOneTime = this.formData.entryType === 'O';
    this.isRecurring = this.formData.entryType === 'R';
  }
  ngOnInit(): void {
    this.corporateCodeAllDetail();
    this.corporateTypeTxt = 'corporateCode';
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
  }
  ngAfterViewInit(): void {
    this.toggleValueDate();
  }

  filterDataObj = {
    page: 0,
    size: 4,
  };
  onPrevious() {
    if (this.filterDataObj.page > 0) {
      this.filterDataObj.page--;
      this.corporateCodeAllDetail();
    }
  }
  onNext() {
    this.filterDataObj.page++;
    this.corporateCodeAllDetail();
  }

  corporateCodeAllDetail(): void {
    const params = new HttpParams()
      .set('page', this.filterDataObj.page.toString())
      .set('size', this.filterDataObj.size.toString());

    this.http.get(this.apiAllUrl, { params }).subscribe(
      (result: any) => {
        if (result && result.data && result.data.content) {
          this.users = result.data.content.slice(0, 3);
          this.filteredUsers = [...this.users];
        } else {
          console.error('Unexpected response structure', result);
        }
      },
      (error) => console.error('Subscription error', error)
    );
  }

  openPopup() {
    this.corporateCodeAllDetail();
  }

  searchByCorporate(corporateCode: string): void {
    let url = baseUrl + 'corporate/corporate-code/' + this.searchbyTxt;
    if (corporateCode === 'corporateName') {
      url = baseUrl + 'corporate/corporate-name/' + this.searchbyTxt;
    }
    this.http.get(url).subscribe(
      (result: any) => {
        this.filteredUsers = result.data.content;
      },
      (error) => console.error('Subscription error', error)
    );
  }

  corporateTypeTxt: any;
  onSearchClick(): void {
    let url = baseUrl + 'corporate/corporate-code/' + this.searchbyTxt;

    // Check if the search is by corporate name instead of code
    if (this.corporateTypeTxt === 'corporateName') {
      url = baseUrl + 'corporate/corporate-name/' + this.searchbyTxt;
    }

    // Initiating the HTTP request
    this.http.get(url).subscribe(
      (result: any) => {
        // If successful, assign the result to filteredUsers
        if (result && result.data && result.data.content) {
          this.filteredUsers = result.data.content;
        } else {
          // Handle the case where no data is returned
          this.showError(
            'No results found for the provided corporate code or name.'
          );
        }
      },
      (error) => {
        // Handle error - Display a user-friendly message based on error type
        if (error.status === 404) {
          this.showError(
            'Corporate code or name not found. Please enter a valid one.'
          );
        } else {
          this.showError(
            'An error occurred during the search. Please try again.'
          );
        }
        console.error('Search error:', error);
      }
    );
  }

  showError(message: string): void {
    alert(message);
  }

  toggleValueDate(): void {
    const entryType = (
      document.getElementById('entryType') as HTMLSelectElement
    ).value;
    const valueDateField = document.getElementById(
      'valueDateField'
    ) as HTMLElement;
    const recurringFieldsFrom = document.getElementById(
      'recurringFieldsFrom'
    ) as HTMLElement;
    const recurringFieldsTo = document.getElementById(
      'recurringFieldsTo'
    ) as HTMLElement;
    const recurringFieldsPattern = document.getElementById(
      'recurringFieldsPattern'
    ) as HTMLElement;

    if (entryType === 'O') {
      valueDateField.style.display = 'block';
      recurringFieldsFrom.style.display = 'none';
      recurringFieldsTo.style.display = 'none';
      recurringFieldsPattern.style.display = 'none';
    } else if (entryType === 'R') {
      valueDateField.style.display = 'none';
      recurringFieldsFrom.style.display = 'block';
      recurringFieldsTo.style.display = 'block';
      recurringFieldsPattern.style.display = 'block';
    } else {
      valueDateField.style.display = 'none';
      recurringFieldsFrom.style.display = 'none';
      recurringFieldsTo.style.display = 'none';
      recurringFieldsPattern.style.display = 'none';
    }
  }

  refreshData(): void {
    this.corporateCodeAllDetail();
  }

  onAccountTypeChange() {
    if (this.formData.corporateCode && this.formData.accountType) {
      const url =
        baseUrl +
        `accounts/by-type?accountType=${this.formData.accountType}&corporateId=${this.corporateCodeId}`;
      this.http.get(url).subscribe((response: any) => {
        this.accountTypes = response.data;
      });
    } else {
      this.alertService.showAlert(
        'Error',
        'Please add Corporate Code and select an Account Type first'
      );
    }
  }

  corporateCodeId: any;
  selectRow(user: any): void {
    this.corporateCodeId = user.id;
    this.formData.corporateCode = user.corporateCode;
    this.formData.corporateName = user.corporateName;
  }

  submitForm(): void {
    const missingFields = this.checkForMissingFields();

    if (missingFields.length > 0) {
      this.alertService.showAlert(
        'Missing Field',
        `The following fields are missing: ${missingFields.join(', ')}`
      );
    } else {
      this.http
        .post(baseUrl + 'forecasts', this.formData)
        .pipe(
          catchError((error) => {
            this.alertService.showAlert(
              'Error',
              'Error occurred while saving the forecast.'
            );
            return throwError(error);
          })
        )
        .subscribe((response) => {
          this.alertService.showAlert(
            'Success',
            'Forecast saved successfully!'
          );
          this.formData = {
            corporateCode: '',
            corporateName: '',
            forecastingAs: '',
            forecastCurrency: 'INR',
            entryType: '',
            narration: '',
            description: '',
            mode: '',
            beneficiaryPayers: '',
            accountType: '',
            accountNumber: '',
            forecastedAmount: '',
            lockRecord: false,
            valueDate: '',
            recurringFrom: '',
            recurringTo: '',
            recurrencePattern: '',
          };
        });
    }
  }

  cancel() {
    this.formData = {
      corporateCode: '',
      corporateName: '',
      forecastingAs: '',
      forecastCurrency: 'INR',
      entryType: '',
      narration: '',
      description: '',
      mode: '',
      beneficiaryPayers: '',
      accountType: '',
      accountNumber: '',
      forecastedAmount: '',
      lockRecord: false,
      valueDate: '',
      recurringFrom: '',
      recurringTo: '',
      recurrencePattern: '',
    };
  }

  // checkForMissingFields(): string[] {
  //   const requiredFields = [
  //     'corporateCode',
  //     'forecastingAs',
  //     'entryType',
  //     'narration',
  //     'mode',
  //     'accountType',
  //     'accountNumber',
  //     'forecastedAmount',
  //   ];

  //   // Cast formData to `any` for dynamic access
  //   const missingFields = requiredFields.filter(
  //     (field) => !(this.formData as any)[field]
  //   );

  //   return missingFields;
  // }

  // new api for by type

  checkForMissingFields(): string[] {
    const missingFields = [];

    // EntryType: 'One Time' requires 'valueDate' to be selected
    if (this.formData.entryType === 'O' && !this.formData.valueDate) {
      missingFields.push('valueDate');
    }

    // EntryType: 'Recurring' requires 'recurringFrom', 'recurringTo', and 'recurringPattern' to be selected
    if (this.formData.entryType === 'R') {
      if (!this.formData.recurringFrom) {
        missingFields.push('recurringFrom');
      }
      if (!this.formData.recurringTo) {
        missingFields.push('recurringTo');
      }
      if (!this.formData.recurrencePattern) {
        missingFields.push('recurringPattern');
      }
    }

    return missingFields;
  }

  loadAccountNumbers(selectedType: string): void {
    const corporateId = 3; // Assuming corporate ID is constant or obtained elsewhere
    let encodedType = encodeURIComponent(selectedType.trim()); // Encode to handle spaces and special characters

    if (encodedType === 'internal Account') {
      encodedType = 'Internal Account';
    } else if (encodedType === 'externalAccount') {
      encodedType = 'External Account';
    }

    const url = `${baseUrl}accounts/by-type?accountType=${encodeURIComponent(
      encodedType
    )}&corporateId=${corporateId}`;
    console.log('Fetching account numbers with URL:', url); // Log the request URL for debugging

    this.http.get<any>(url).subscribe(
      (result) => {
        console.log('API response:', result); // Log the API response to inspect its structure
        if (result && result.data) {
          this.accountTypes = result.data.map((item: any) => ({
            value: item.accountNumber, // Use accountNumber as the value
            text: item.accountNumber, // Use accountNumber as the display text
          }));
        } else {
          this.accountTypes = [];
          console.error('Unexpected response structure:', result); // Log if the response is null or unexpected
        }
        this.cdr.detectChanges(); // Update the view with new data
      },
      (error) => {
        console.error('Error fetching account numbers:', error); // Log any errors encountered
        this.alertService.showAlert('Error', 'Error fetching account numbers.');
      }
    );
  }
}
