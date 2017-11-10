package p01.priority;
/**[스레드]
 * 우선순위
 * 쓰레드의 우선순위는 1~10까지 존재, 숫자가 높은 쓰레드가 우선순위가 높다
 * (MIN_PRIORITY(1) ~ MAX_PRIORITY(10))
 * 우선순위 강제 조정: setPriority(숫자); 원하는 우선순위로 조정
 **/
public class PriorityExample {
	public static void main(String[] args) {
		for (int i = 0; i <= 10; i++) {
			//스레드 객체 생성 Thread객체로 Promotion처리
			Thread thread = new CalcThread("thread"+i);
			if(i!=10) {
				thread.setPriority(Thread.MIN_PRIORITY); //setPriority를 이용하여 우선순위 조정(가장 낮은 우선순위)
			}else {
				thread.setPriority(Thread.MAX_PRIORITY); //가장 높은 우선순위
			}
			thread.start();//실행
		}
	}
}
