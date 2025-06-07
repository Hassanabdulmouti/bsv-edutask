import pytest
from unittest.mock import MagicMock
from src.controllers.usercontroller import UserController

pytestmark = pytest.mark.unit

@pytest.fixture
def mock_dao():
    return MagicMock()

@pytest.fixture
def controller(mock_dao):
    return UserController(dao=mock_dao)

def test_get_user_by_email_single_user(controller, mock_dao):
    mock_dao.find.return_value = [{'email': 'test@mail.com'}]
    result = controller.get_user_by_email('test@mail.com')
    assert result['email'] == 'test@mail.com'

def test_get_user_by_email_multiple_users(controller, mock_dao, capsys):
    mock_dao.find.return_value = [
        {'email': 'test@mail.com'},
        {'email': 'test@mail.com'}
    ]
    result = controller.get_user_by_email('test@mail.com')
    captured = capsys.readouterr()
    assert result['email'] == 'test@mail.com'
    assert 'more than one user found' in captured.out

def test_get_user_by_email_not_found(controller, mock_dao):
    mock_dao.find.return_value = []
    with pytest.raises(IndexError):
        controller.get_user_by_email('test@mail.com')

def test_get_user_by_email_invalid_format(controller):
    with pytest.raises(ValueError):
        controller.get_user_by_email('invalidmail.com')

def test_get_user_by_email_db_exception(controller, mock_dao):
    mock_dao.find.side_effect = Exception("Database failure")
    with pytest.raises(Exception) as exc_info:
        controller.get_user_by_email('test@mail.com')
    assert "Database failure" in str(exc_info.value)
