package p05.newInstance;
/**[API]
 * 
 **/
public class NewInstanceExample {
	public static void main(String[] args) {
		try {
//			Class clazz = Class.forName("p05.newInstance.SendAction");
			Class clazz = Class.forName("p05.newInstance.ReceiveAction");
			Action action = (Action)clazz.newInstance(); //new SendAction();과 같다
			action.execute(); //execute()가 재정의 되었으므로 재정의된 메소드가 실행됨
		} catch (InstantiationException e) {
			System.out.println(e.getMessage());
		} catch (IllegalAccessException e) {
			System.out.println(e.getMessage());
		}catch(ClassNotFoundException e) {
			System.out.println(e.getMessage());
		}
	}
}
