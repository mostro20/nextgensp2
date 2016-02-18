import unittest
from api.models import *
from api.notificationService import *
from services.settings import *

def createSessionService():
    mc = UserMongoContext('localhost', 27017)
    sqlC = SqlDataContext("nextgensp2", "postgres")
    return SessionService(mc, sqlC)

def createNotificationService():
    sender = HTMLFileCreator(TEMP_FOLDER+'/notificationservicetests_test_send.html')
    return NotificationService(sender)

def createHandler():
    c = DrupalDataContext(DRUPAL_API)
    ns = createNotificationService()
    return Handler(c, createSessionService(), createNotificationService())

class integrationTests(unittest.TestCase):
    sessionId = "b62b8c8d-24b4-4999-34a9-5c79807ad5e1"

    def test_removeSession(self):
        handler = createHandler()
        handler.removeSession(integrationTests.sessionId)
        self.assertFalse(handler.sessionExists(integrationTests.sessionId))

    def test_addService(self):
        handler = createHandler()

        #create session
        handler.createSession(integrationTests.sessionId)

        #get the items
        query = handler.getById(290, 1) 
        service = handler.getById(291, 1) 

        handler.addServiceTracking(integrationTests.sessionId, service, query)

    def test_checkOneEntry(self):
        result = createHandler().getServices(integrationTests.sessionId)
        self.assertTrue(len(result) == 1)

    def test_removeService(self):
        handler = createHandler()

        #get the items
        query = handler.getById(290, 1) 
        service = handler.getById(291, 1) 

        #remove
        handler.removeServiceTracking(integrationTests.sessionId, int(service['id']), int(query['id']))

    def test_checkNoEntries(self):         
        handler = createHandler()
        result = createHandler().getServices(integrationTests.sessionId)
        self.assertTrue(len(result) == 0)

    def test_getServices(self):
        handler = createHandler()
        print handler.getServices(integrationTests.sessionId)

if __name__ == '__main__':
    unittest.main()
