package p09.stackQueue;

import java.util.LinkedList;
import java.util.Queue;

/**Stack&Queue
 * Queue
 * 작업객체인경우 queue에 저장하여 순서대로 실행하는 경우 사용
 **/
public class QueueExample {
	public static void main(String[] args) {
		Queue<Message> messageQueue = new LinkedList<>();
		//offer(): queue에 객체 저장 
		messageQueue.offer(new Message("SendMail","홍길동"));
		messageQueue.offer(new Message("SendSMS","일지매"));
		messageQueue.offer(new Message("SendKatok","임꺽정"));
		
		while(!messageQueue.isEmpty()) { //비어있는지 확인 메소드
			Message message = messageQueue.poll(); //가장먼저 저장된 객체(작업)을 출력
			switch(message.command) { //switch("문자열"): Java 7에서 추가된 기능
			case "SendMail": 
				System.out.println(message.to+"님에게 메일을 보냅니다.");
				break;
			case "SendSMS": 
				System.out.println(message.to + "님에게 SMS를 보냅니다.");
				break;
			case "SendKatok": 
				System.out.println(message.to + "님에게 KAKAOTALK를 보냅니다.");
				break;
			}
		}
	}
}
