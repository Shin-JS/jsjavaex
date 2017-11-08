package p10.innerInterface;
/**[중첩인터페이스]
 * -.중첩인터페이스의 구현: implements 바깥클래스.안쪽인터페이스
 **/
public class MessageListener implements Button.OnClickListener{

	@Override
	public void onClick() {
		System.out.println("메세지를 보냅니다.");
	}

}
