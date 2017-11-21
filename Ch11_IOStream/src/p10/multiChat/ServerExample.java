package p10.multiChat;

import java.net.ServerSocket;
import java.net.Socket;

/**[채팅프로그램]
 * 
 **/
public class ServerExample {
	public static void main(String[] args) {
		ServerSocket serverSocket = null;
		try {
			serverSocket = new ServerSocket(5001);
			while(true){
				Socket socket = serverSocket.accept();
				Thread thread = new PerClientThread(socket);
				thread.start();
			}
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
