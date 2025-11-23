interface Agent {
  id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  idType: string;
  idNumber: string;
  profilePictureUrl: string | null;
  locationCity: string | null;
  locationAddress: string | null;
  referralCode: string | null;
  status: 'pending_review' | 'approved' | 'suspended' | 'rejected';
  approvedAt: Date | null;
  rejectionReason: string | null;
  suspendedAt: Date | null;
  suspensionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}