package p10.chatting;

import java.net.ServerSocket;
import java.net.Socket;

/**[채팅프로그램]
 * -.서버는 ServerSocket을 가짐: ServerSocket이 Socket을 생성
 **/
public class ServerExample {
	public static void main(String[] args) {
		//소켓 생성
		ServerSocket serverSocket = null;
		Socket socket = null;
		try {
			serverSocket = new ServerSocket(5001); //port번호 5001로 서버소켓 생성
			socket = serverSocket.accept(); //소켓생성 메소드: accept();
			Thread th1 = new SenderThread(socket);
			Thread th2 = new ReceiverThread(socket);
			th1.start();
			th2.start();			
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}finally { //서버 종료시 소켓을 해제
			try {
				serverSocket.close();
			} catch (Exception e) {
				System.out.println(e.getMessage());
			}
		}
	}
}
