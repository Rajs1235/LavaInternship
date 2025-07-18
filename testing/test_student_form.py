import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.options import Options as FirefoxOptions

# --- Configuration ---
BASE_URL = "http://localhost:5173"
JOB_LISTINGS_URL = f"{BASE_URL}/job-listings"
FORM_URL_IDENTIFIER = "/studentform" # To confirm we've navigated to the form

# --- Helper Functions ---
def setup_driver():
    """Initializes and returns a Selenium WebDriver instance for Firefox."""
    print("Setting up Firefox WebDriver (GeckoDriver)...")
    options = FirefoxOptions()
    
    # Uncomment the line below to run in headless mode (without a visible browser window)
    # options.add_argument("--headless")
    
    # Using GeckoDriverManager to automatically handle the driver for Firefox
    driver = webdriver.Firefox(service=FirefoxService(GeckoDriverManager().install()), options=options)
    driver.maximize_window()
    return driver

def create_dummy_file(filename, size_in_mb):
    """Creates a dummy file of a specified size for testing uploads."""
    print(f"Creating dummy file '{filename}' of size {size_in_mb}MB...")
    with open(filename, 'wb') as f:
        f.write(os.urandom(size_in_mb * 1024 * 1024))
    return os.path.abspath(filename)

def find_and_apply_for_job(driver, job_title="Recuiter"):
    """Navigates to job listings, finds a job, and clicks 'Apply Now'."""
    print(f"\n--- Navigating to Job Listings and finding '{job_title}' ---")
    driver.get(JOB_LISTINGS_URL)
    time.sleep(3) # Allow time for jobs to load

    try:
        # Find all job cards
        job_cards = driver.find_elements(By.XPATH, "//div[contains(@class, 'bg-white rounded-lg')]")
        print(f"Found {len(job_cards)} job cards.")
        
        job_found = False
        for card in job_cards:
            try:
                title_element = card.find_element(By.XPATH, ".//h3[contains(@class, 'text-xl')]")
                if job_title.lower() in title_element.text.lower():
                    print(f"Found job: {title_element.text}. Clicking 'Apply Now'.")
                    apply_button = card.find_element(By.XPATH, ".//button[text()='Apply Now']")
                    driver.execute_script("arguments[0].click();", apply_button)
                    job_found = True
                    break
            except Exception:
                continue # Ignore cards that don't match the structure

        if not job_found:
            print(f"Error: Could not find a job titled '{job_title}'. Exiting.")
            return False

        # Wait until the URL changes to the student form page
        WebDriverWait(driver, 10).until(EC.url_contains(FORM_URL_IDENTIFIER))
        print("Successfully navigated to the student resume form.")
        return True

    except Exception as e:
        print(f"An error occurred while trying to apply for the job: {e}")
        return False

def check_for_error_message(driver, field_name, expected_error_text):
    """Checks if a specific error message is visible for a given field."""
    try:
        # Find the input/select element by its name attribute
        input_element = driver.find_element(By.NAME, field_name)
        # Find the error message element, which is usually a sibling or parent's sibling
        error_element = input_element.find_element(By.XPATH, "./following-sibling::p[contains(@class, 'text-red-500')]")
        if expected_error_text in error_element.text:
            print(f"  ✅ PASS: Correct error message found for '{field_name}': '{error_element.text}'")
            return True
        else:
            print(f"  ❌ FAIL: Incorrect error message for '{field_name}'. Expected to contain '{expected_error_text}', but found '{error_element.text}'")
            return False
    except Exception:
        print(f"  ❌ FAIL: No error message found for field '{field_name}'.")
        return False


# --- Test Cases ---

def test_empty_submission(driver):
    """Test Case 1: Submit the form with all required fields empty."""
    print("\n--- Test Case 1: Empty Submission ---")
    if not find_and_apply_for_job(driver): return
    
    submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit_button.click()
    time.sleep(1) # Allow time for validation messages to appear
    
    print("Checking for validation errors on empty fields...")
    # Check a few key fields for error messages
    pass1 = check_for_error_message(driver, "name", "at least 2 characters")
    pass2 = check_for_error_message(driver, "email", "valid email")
    pass3 = check_for_error_message(driver, "contact", "valid 10-digit")
    pass4 = check_for_error_message(driver, "resume", "Please select a file")

    if all([pass1, pass2, pass3, pass4]):
        print("Overall Result: ✅ Empty Submission test PASSED.")
    else:
        print("Overall Result: ❌ Empty Submission test FAILED.")

def test_invalid_data_formats(driver):
    """Test Case 2: Test various invalid data formats."""
    print("\n--- Test Case 2: Invalid Data Formats ---")
    if not find_and_apply_for_job(driver): return

    # Test invalid email
    print("\nTesting invalid email...")
    email_field = driver.find_element(By.NAME, "email")
    email_field.send_keys("invalid-email.com")
    driver.find_element(By.NAME, "name").click() # Click away to trigger validation
    time.sleep(1)
    check_for_error_message(driver, "email", "valid email")

    # Test invalid phone number
    print("\nTesting invalid phone number...")
    phone_field = driver.find_element(By.NAME, "contact")
    phone_field.clear()
    phone_field.send_keys("12345")
    driver.find_element(By.NAME, "name").click()
    time.sleep(1)
    check_for_error_message(driver, "contact", "valid 10-digit")

    # Test illogical dates
    print("\nTesting illogical dates (Graduation before 12th)...")
    pass12_field = driver.find_element(By.NAME, "pass12")
    grad_year_field = driver.find_element(By.NAME, "gradYear")
    pass12_field.send_keys("2020-05-15")
    grad_year_field.send_keys("2019-05-15")
    driver.find_element(By.NAME, "name").click()
    time.sleep(1)
    check_for_error_message(driver, "gradYear", "cannot be before 12th")


def test_file_uploads(driver):
    """Test Case 3: Test invalid file type and oversized file uploads."""
    print("\n--- Test Case 3: File Uploads ---")
    
    # Create dummy files
    invalid_file = create_dummy_file("invalid.txt", 1)
    oversized_file = create_dummy_file("too_large.pdf", 4)

    # Test invalid file type
    if not find_and_apply_for_job(driver): return
    print("\nTesting invalid file type (.txt)...")
    resume_field = driver.find_element(By.NAME, "resume")
    resume_field.send_keys(invalid_file)
    driver.find_element(By.NAME, "name").click()
    time.sleep(1)
    check_for_error_message(driver, "resume", "Only PDF, DOC, or DOCX")

    # Test oversized file
    if not find_and_apply_for_job(driver): return
    print("\nTesting oversized file (>3MB)...")
    resume_field = driver.find_element(By.NAME, "resume")
    resume_field.send_keys(oversized_file)
    driver.find_element(By.NAME, "name").click()
    time.sleep(1)
    check_for_error_message(driver, "resume", "Maximum allowed is 3 MB")

    # Clean up dummy files
    print("\nCleaning up dummy files...")
    os.remove(invalid_file)
    os.remove(oversized_file)


def test_successful_submission(driver):
    """Test Case 4: Test a complete, valid submission."""
    print("\n--- Test Case 4: Successful Submission ---")
    if not find_and_apply_for_job(driver): return

    # Create a valid dummy resume file
    valid_resume_path = create_dummy_file("valid_resume.pdf", 1)

    print("Filling form with valid data...")
    driver.find_element(By.NAME, "name").send_keys("Test User")
    driver.find_element(By.NAME, "email").send_keys("test.user.success@example.com")
    driver.find_element(By.NAME, "contact").send_keys("9876543210")
    driver.find_element(By.NAME, "Gender").send_keys("Male")
    driver.find_element(By.NAME, "pass12").send_keys("2018-06-01")
    driver.find_element(By.NAME, "marks12").send_keys("85")
    driver.find_element(By.NAME, "gradYear").send_keys("2022-07-15")
    driver.find_element(By.NAME, "gradMarks").send_keys("75.5")
    driver.find_element(By.NAME, "workPref").send_keys("Hybrid")
    driver.find_element(By.NAME, "address").send_keys("123 Test Street, Test City")
    driver.find_element(By.NAME, "linkedIn").send_keys("https://linkedin.com/in/test-user-123")
    driver.find_element(By.NAME, "resume").send_keys(valid_resume_path)
    
    print("Submitting the form...")
    driver.find_element(By.XPATH, "//button[@type='submit']").click()

    try:
        # Wait for the success toast message to appear
        toast = WebDriverWait(driver, 20).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), 'Form submitted successfully!')]"))
        )
        print("  ✅ PASS: Success toast message appeared.")
        print("Overall Result: ✅ Successful Submission test PASSED.")
    except Exception as e:
        print(f"  ❌ FAIL: Did not find success toast message. Error: {e}")
        print("Overall Result: ❌ Successful Submission test FAILED.")
    finally:
        # Clean up the valid resume file
        os.remove(valid_resume_path)


# --- Main Execution Block ---
if __name__ == "__main__":
    driver = setup_driver()
    try:
        test_empty_submission(driver)
        time.sleep(2)
        test_invalid_data_formats(driver)
        time.sleep(2)
        test_file_uploads(driver)
        time.sleep(2)
        test_successful_submission(driver)
        time.sleep(5) # Final pause to observe the result
    except Exception as e:
        print(f"\nAn unexpected error occurred during the test run: {e}")
    finally:
        print("\n--- Test run finished. Closing WebDriver. ---")
        driver.quit()
