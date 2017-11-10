package p01.synchronize;
/**[스레드]
 * 
 **/
public class TwoToilets {
	//필드
	private String User1;
	private String User2;
	private boolean is_1_Empty; //flag
	private boolean is_2_Empty; //flag
	
	//생성자
	public TwoToilets() {
		is_1_Empty = true; //빈 상태
		is_2_Empty = true; //빈 상태
	}
	
	//메소드
	public synchronized void use(String userName) throws InterruptedException{
		while((is_1_Empty==false)&&(is_2_Empty==false)) {//비어있지 않은상태(is_1_Empty가 false인동안)
			wait(); //다른 스레드들에게 wait신호를 보냄
			} 
		if(is_1_Empty==true) { //비어있는상태
			User1 = userName; //점유
			is_1_Empty = false;
			System.out.println("화장실1:"+User1+" 사용중");
		}else if(is_2_Empty==true) {
			User2 = userName;
			is_2_Empty = false;
			System.out.println("화장실2:"+User2+" 사용중");
		}
			
	}
	
	public synchronized void done(String userName) {
		if(userName.equals(User1)) { //매개변수로 받은 이름과 사용중인 이름이 같으면
			User1 = null; //User1의 값을 비우고
			is_1_Empty=true; //flag를 사용중에서 비어있는 상태로 변경
			System.out.println("화장실1: "+userName + "사용완료, 현재 비어있음");
		}else if(userName.equals(User2)) { //매개변수로 받은 이름과 사용중인 이름이 같으면
			User2 = null; //User2의 값을 비우고
			is_2_Empty=true; //flag를 사용중에서 비어있는 상태로 변경
			System.out.println("화장실2: "+userName + "사용완료, 현재 비어있음");
		}
		notifyAll(); //기다리는 스레드들에게 작업이 완료되었음을 알리는 메소드
	}
}
