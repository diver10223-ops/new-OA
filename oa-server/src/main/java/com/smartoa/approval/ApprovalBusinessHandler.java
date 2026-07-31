package com.smartoa.approval;

public interface ApprovalBusinessHandler {
    String businessType();
    void approved(long businessId);
    void rejected(long businessId);
    void withdrawn(long businessId);
}
