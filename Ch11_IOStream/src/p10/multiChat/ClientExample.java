package p10.multiChat;

import java.net.Socket;

/**[채팅프로그램]
 * 멀티..
 ***/
public class ClientExample {
	public static void main(String[] args) {
		try {
			Socket socket = new Socket("192.168.10.65", 5001); //소켓 생성
			Thread th1 = new SenderThread(socket, "ShinJS"); //쓰레드 생성
			Thread th2 = new ReceiverThread(socket); //쓰레드 생성
			th1.start(); //쓰레드 호출
			th2.start(); //쓰레드 호출
			
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
