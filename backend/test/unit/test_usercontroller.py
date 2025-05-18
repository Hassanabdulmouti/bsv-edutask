import pytest
pytestmark = pytest.mark.unit  
from unittest.mock import MagicMock
from src.controllers.usercontroller import UserController

@pytest.fixture
def mock_dao():
    return MagicMock()

@pytest.fixture
def controller(mock_dao):
    return UserController(dao=mock_dao)

def test_get_user_by_email_found(controller, mock_dao):
    mock_dao.find.return_value = [{'email': 'test@example.com'}]
    result = controller.get_user_by_email('test@example.com')
    assert result['email'] == 'test@example.com'

def test_get_user_by_email_not_found(controller, mock_dao):
    mock_dao.find.return_value = []

    with pytest.raises(IndexError):
        controller.get_user_by_email('notfound@example.com')

def test_get_user_by_email_empty_string(controller):
    with pytest.raises(ValueError):
        controller.get_user_by_email('')

def test_get_user_by_email_case_sensitive(controller, mock_dao):
    mock_dao.find.return_value = [{'email': 'Test@Example.Com'}]
    result = controller.get_user_by_email('Test@Example.Com')
    assert result['email'] == 'Test@Example.Com'
