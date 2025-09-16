import { faker } from '@faker-js/faker';

const baseUrl = 'https://demoqa.com/'

describe('Front end validation', () => {
    beforeEach(() => {
        cy.visit(baseUrl)
        cy.viewport(1920, 1080)
        Cypress.on('uncaught:exception', (err, runnable) => {
            if (err.message.includes('Script error')) {
                return false;
            }
            return true;
        });
    });

    it('Fill and check the form', () => {
        // Randonm data generation
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName });
        const mobile = faker.string.numeric(10);
        const currentAddress = faker.location.streetAddress();

        // 1. Fill personal information 
        cy.contains('h5', 'Forms').click()
        cy.contains('Practice Form').click()
        cy.get('#firstName').type(firstName);
        cy.get('#lastName').type(lastName);
        cy.get('#userEmail').type(email);

        // 2. Select gender (randomly)
        const randomGender = Math.floor(Math.random() * 3) + 1;
        cy.get(`#gender-radio-${randomGender}`).check({ force: true });

        // 3. FIll mobile number
        cy.get('#userNumber').type(mobile);

        // 4. Fill birth date
        cy.get('#dateOfBirthInput').click();
        cy.get('.react-datepicker__month-select').select('January');
        cy.get('.react-datepicker__year-select').select('1990');
        cy.get('.react-datepicker__day--015').click();

        // 5. Fill subjects
        cy.get('#subjectsInput').type('Maths{enter}');
        cy.get('#subjectsInput').type('Physics{enter}');

        // 6. Fill hobbies (randomly)
        const hobbies = ['#hobbies-checkbox-1', '#hobbies-checkbox-2', '#hobbies-checkbox-3'];
        const randomHobbyIndex = Math.floor(Math.random() * hobbies.length);
        cy.get(hobbies[randomHobbyIndex]).check({ force: true });

        // 7. Uploading a txt file
        cy.get('#uploadPicture').selectFile('cypress/fixtures/file.txt', { force: true });

        // 8. Fill current address
        cy.get('#currentAddress').type(currentAddress);
        cy.get('#state').click();
        cy.get('#react-select-3-option-0').click();
        cy.get('#city').click();
        cy.get('#react-select-4-option-0').click();

        // 9. Scroll and click submit button
        cy.get('#submit').click({ force: true });

        // 11. Modal assertion
        cy.get('.modal-content').should('be.visible');
        cy.get('#example-modal-sizes-title-lg').should('contain', 'Thanks for submitting the form');
        cy.get('.table').should('contain', firstName);
        cy.get('.table').should('contain', lastName);
        cy.get('.table').should('contain', email);
        cy.get('.table').should('contain', mobile);
        cy.get('#closeLargeModal').click();
        cy.get('.modal-content').should('not.exist');
    });

    it('Verify the new page', () => {
        cy.contains('h5', 'Alerts, Frame & Windows').click()
        cy.request('GET', 'https://demoqa.com/sample').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.include('This is a sample page');
        });
    });

    it('Verify web tables', () => {
        cy.contains('h5', 'Elements').click();
        cy.contains('Web Tables').click();
        const userData = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            age: faker.number.int({ min: 18, max: 65 }),
            salary: faker.number.int({ min: 1000, max: 10000 }),
            department: faker.commerce.department()
        };
        // 1. Creating new record
        cy.get('#addNewRecordButton').click();
        cy.get('#firstName').type(userData.firstName);
        cy.get('#lastName').type(userData.lastName);
        cy.get('#userEmail').type(userData.email);
        cy.get('#age').type(userData.age);
        cy.get('#salary').type(userData.salary);
        cy.get('#department').type(userData.department);
        cy.get('#submit').click();

        // 2. Verifying new record
        cy.get('.rt-tbody').should('contain', userData.firstName);
        cy.get('.rt-tbody').should('contain', userData.email);

        // 3. Editing record
        cy.contains('.rt-tbody .rt-tr-group', userData.email)
            .find('[id^="edit-record-"]').click();
        const newFirstName = faker.person.firstName();
        cy.get('#firstName').clear().type(newFirstName);
        cy.get('#submit').click();

        // 4. Verifying edited record
        cy.get('.rt-tbody').should('contain', newFirstName);
        cy.get('.rt-tbody').should('not.contain', userData.firstName);

        // 5. Deleting record
        cy.contains('.rt-tbody .rt-tr-group', userData.email)
            .find('[id^="delete-record-"]').click();
        cy.get('.rt-tbody').should('not.contain', newFirstName);
    });

    it('Progress bar test', () => {
        const targetValue = Math.floor(Math.random() * 25);

        cy.contains('h5', 'Widgets').click();
        cy.contains('Progress Bar').click();
        cy.get('#startStopButton').click();
        cy.wait(100 * targetValue);
        cy.get('#progressBar').invoke('val')
            .then((val) => {
                expect(targetValue + 1).to.be.lessThan(25);
                cy.get('#startStopButton').click();
            });
        cy.wait(5000);
        cy.get('#startStopButton').click();
    });

    it('Drag and Drop test', () => {

        cy.contains('h5', 'Interactions').click();
        cy.contains('Sortable').click();

        // Move one to the position of three
        cy.contains('.list-group-item', 'One')
            .drag('.list-group-item:contains("Three")', { position: 'bottom' });

        // Move six to the top
        cy.contains('.list-group-item', 'Six')
            .drag('.list-group-item:first()', { position: 'top' });

        // Verify new order
        cy.get('.list-group-item').first().should('contain', 'Six');
        cy.get('.list-group-item').eq(2).should('contain', 'One');
    });
});