export class ApplicationItem {
  constructor(
    public itemName: string = '',
    public description: string = '',
    public quantity: number = 0,
    public unitPrice: number = 0,
    public totalPrice: number = 0
  ) {}
}

export class Application {
  constructor(
    public id: number = 0,
    public serviceType: string = '',
    public applicantName: string = '',
    public applicantEmail: string = '',
    public applicantAddress: string = '',
    public applicantPhone: string = '',
    public businessName: string = '',
    public applicationItems: ApplicationItem[] = [],
    public applicationDate: Date = new Date(),
    public totalCost: number = 0,
    public processingFee: number = 0,
    public grandTotal: number = 0,
    public status: string = 'Pending',
    public remarks: string = '',
    public completed: boolean = false,
    public isSelected: boolean = false
  ) {}
}
