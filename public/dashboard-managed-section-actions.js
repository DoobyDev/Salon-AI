// Injects manage-only shortcut rows into dashboard sections for subscriber/admin roles.
export function createManagedSectionActionsRuntime(deps) {
  const {
    isDashboardManagerRole,
    bookingOperationsSection,
    staffRosterSection,
    waitlistSection,
    socialMediaSection,
    crmSection,
    commercialSection,
    merchSection,
    accountingIntegrationsSection,
    revenueAttributionSection,
    profitabilitySection
  } = deps || {};

  function ensureManageRow(section, rowId, html) {
    if (!(section instanceof HTMLElement) || document.getElementById(rowId)) return;
    const row = document.createElement("div");
    row.id = rowId;
    row.className = "manage-row manage-only";
    row.innerHTML = html;
    const heading = section.querySelector("h2");
    if (heading?.parentElement) {
      heading.parentElement.insertBefore(row, heading.nextSibling);
      return;
    }
    section.prepend(row);
  }

  function setupManagedSectionActions() {
    if (!isDashboardManagerRole?.()) return;

    ensureManageRow(
      bookingOperationsSection,
      "bookingManageRow",
      '<button id="manageAddBooking" class="btn btn-ghost" type="button">Add Booking</button>'
    );
    ensureManageRow(
      staffRosterSection,
      "staffManageRow",
      '<button id="manageAddStaff" class="btn btn-ghost" type="button">Add Staff</button>'
    );
    ensureManageRow(
      waitlistSection,
      "waitlistManageRow",
      '<button id="manageAddWaitlist" class="btn btn-ghost" type="button">Add Waitlist Entry</button>'
    );
    ensureManageRow(
      socialMediaSection,
      "socialManageRow",
      '<button id="manageAddSocialLink" class="btn btn-ghost" type="button">Add Social Link</button><button id="manageClearSocialLinks" class="btn btn-ghost" type="button">Delete All Links</button>'
    );
    ensureManageRow(
      crmSection,
      "crmManageRow",
      '<button id="manageAddCrmCampaign" class="btn btn-ghost" type="button">Add Campaign Activity</button>'
    );
    ensureManageRow(
      commercialSection,
      "commercialManageRow",
      '<button id="manageAddMembership" class="btn btn-ghost" type="button">Add Membership</button><button id="manageAddPackage" class="btn btn-ghost" type="button">Add Package</button><button id="manageAddGiftCard" class="btn btn-ghost" type="button">Add Gift Card</button>'
    );
    ensureManageRow(
      merchSection,
      "merchManageRow",
      '<button id="manageAddMerchProduct" class="btn btn-ghost" type="button">Add Product</button>'
    );
    ensureManageRow(
      accountingIntegrationsSection,
      "accountingManageRow",
      '<button id="manageAddAccountingIntegration" class="btn btn-ghost" type="button">Add Integration</button><button id="manageDisconnectAllAccounting" class="btn btn-ghost" type="button">Delete All Integrations</button>'
    );
    ensureManageRow(
      revenueAttributionSection,
      "revenueManageRow",
      '<button id="manageAddRevenueSpend" class="btn btn-ghost" type="button">Add Spend</button>'
    );
    ensureManageRow(
      profitabilitySection,
      "profitManageRow",
      '<button id="manageAddPayrollEntry" class="btn btn-ghost" type="button">Add Payroll</button><button id="manageEditCostInputs" class="btn btn-ghost" type="button">Edit Costs</button><button id="manageDeleteCostInputs" class="btn btn-ghost" type="button">Delete Costs</button>'
    );
  }

  return {
    setupManagedSectionActions
  };
}
