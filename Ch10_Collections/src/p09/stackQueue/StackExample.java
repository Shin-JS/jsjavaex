package p09.stackQueue;

import java.util.Stack;

/**Stack&Queue
 * -.Stack: 가장 먼저 들어간 객체가 가장 나중에 나오는 구조(LIFO)
 **/
public class StackExample {
	public static void main(String[] args) {
		Stack<Coin> coinBox = new Stack<>();
		coinBox.push(new Coin(100)); 
		coinBox.push(new Coin(50));
		coinBox.push(new Coin(500));
		coinBox.push(new Coin(10));
		
		while(!coinBox.isEmpty()) {
			Coin coin = coinBox.pop(); //가장 나중에 저장된 객체가 하나씩 나옴
			System.out.println("꺼내온 동전:" + coin.getValue()+"원");
		}
		
	}
}
