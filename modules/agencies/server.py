#!/usr/bin/env python
import pika
import sys
import time
import json
from blackbox import BlackBox
from services import UserService

url = sys.argv[1:4] or ''

serviceApi = url[0]
userServiceApi = url[1]
agencyId = url[2]

print(" [x] Running")
print("     [x] Service API %r" % serviceApi)
print("     [x] User Service API %r" % userServiceApi)
print("     [x] Agency ID "+ agencyId)

connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))

channel = connection.channel()
result = channel.queue_declare(exclusive=True)
channel.queue_bind(exchange='services',
                   queue=result.method.queue)

def getServices(body, userId):
    userService = UserService(userServiceApi+"?format=json&agencyId="+agencyId+"&userId="+str(userId))
    
    print(" [x] Loading user service "+userServiceApi+"?format=json&agencyId="+agencyId+"&userId="+str(userId))
    box = BlackBox(serviceApi, userService)
    services = box.getWidgets(body)
    for service in services:
        service["AgencyID"] = agencyId
    result = json.dumps(services)
    return result

def reply(ch, method, props, body):
    ch.basic_publish(exchange='nextgensp2',
                     routing_key=props.reply_to,
                     properties=pika.BasicProperties(correlation_id = props.correlation_id),
                     body=str(body))
    ch.basic_ack(delivery_tag = method.delivery_tag)
    print(" [x] Replied to message")

def on_request(ch, method, props, body):
    user_id = props.headers['user_id'] if 'user_id' in props.headers else 0

    msg = json.loads(body)['message'] 

    print(" [x] Message %r" % msg)
    print(" [x] User ID %r" % int(user_id))

    response = getServices(msg, user_id)

    # REPLY BACK TO THE CLIENT
    if len(response) > 0:
        reply(ch, method, props, response) 
    else:
        ch.basic_reject(delivery_tag = method.delivery_tag, requeue=True)
    
channel.basic_qos(prefetch_count=1)
channel.basic_consume(on_request, queue=result.method.queue)

print(" [x] Awaiting requests")
channel.start_consuming()