export interface LoanInformationDTO {
    loan_id: number;
    asset_id?: number | null;
    user_id: number;
    lender_name: string;
    loan_name: string;
    loan_type: string;
    loan_amount: number;
    interest_rate: number;
    loan_term_years: number;
    remaining_balance: number;
    monthly_payment: number;
    payment_frequency: string;
    status: string;
    loan_start_date?: string | null;
    last_payment_date?: string | null;
    next_payment_date?: string | null;
    loan_end_date?: string | null;
    loan_schedule?: any[]; // Define properly if needed later
    created_at?: string;
    updated_at?: string;
}

export interface LoanCreateRequest {
    asset_id?: number | null;
    user_id: number;
    lender_name: string;
    loan_name: string;
    loan_type: string;
    loan_amount: number;
    interest_rate: number;
    loan_term_years: number;
    remaining_balance: number;
    monthly_payment?: number;
    payment_frequency?: string;
    status?: string;
    loan_start_date?: string | null;
}

export interface LoanUpdateRequest {
    loan_id: number;
    asset_id?: number | null;
    user_id: number;
    lender_name: string;
    loan_name: string;
    loan_type: string;
    loan_amount: number;
    interest_rate: number;
    loan_term_years: number;
    remaining_balance: number;
    monthly_payment: number;
    payment_frequency: string;
    status: string;
    loan_start_date?: string | null;
}
