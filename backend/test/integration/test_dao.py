import pytest
from unittest.mock import patch
from pymongo import MongoClient
from pymongo.errors import WriteError

from src.util.dao import DAO

mock_validator = {
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['name', 'email'],
        'properties': {
            'name': {
                'bsonType': 'string',
                'description': 'must be a string and is required'
            },
            'email': {
                'bsonType': 'string',
                'description': 'must be a string and is required'
            }
        }
    }
}


@pytest.fixture(scope="function")
def test_dao():
    client = MongoClient('mongodb://localhost:27017/')
    db = client["test_dao"]
    collection_name = "test_collection"

    if collection_name in db.list_collection_names():
        db.drop_collection(collection_name)

    db.create_collection(collection_name, validator=mock_validator)

    with patch('src.util.dao.getValidator', return_value=mock_validator):
        dao_instance = DAO(collection_name)

    yield dao_instance

    db.drop_collection(collection_name)
    client.close()





def test_create_success(test_dao):
    data = {"name": "jane doe", "email": "jane.doe@mail.com"}
    created = test_dao.create(data)

    assert created["name"] == data["name"]
    assert created["email"] == data["email"]
    assert "_id" in created


def test_create_missing_required_field(test_dao):
    data = {"name": "jane doe"}

    with pytest.raises(WriteError):
        test_dao.create(data)


def test_create_wrong_type_field(test_dao):
    data = {"name": "jane doe", "email": True}

    with pytest.raises(WriteError):
        test_dao.create(data)


def test_create_duplicate_unique_field(test_dao):
    data1 = {"name": "jane doe", "email": "duplicate@mail.com"}
    data2 = {"name": "john doe", "email": "duplicate@mail.com"}

    test_dao.create(data1)

    with pytest.raises(WriteError):
        test_dao.create(data2)



def test_create_empty_object(test_dao):
    data = {}

    with pytest.raises(WriteError):
        test_dao.create(data)