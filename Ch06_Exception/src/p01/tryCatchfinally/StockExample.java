package p01.tryCatchfinally;
/**[예외처리]
*
**/
public class StockExample {
	public static void main(String[] args) {
		//객체생성
		Stock stock = new Stock("새우깡","농심",50);
		System.out.println(stock.getModelName()+"의 현재고는 " + stock.getQty()+"개입니다.");
		
		//입고처리
		stock.inStock(20);//inStock메소드 호출
		System.out.println(stock.getModelName()+"의 현재고는 " + stock.getQty()+"개입니다.");
		
		//출고처리
		try {
		stock.outStock(90); //예외처리 필요
		}catch(Exception e) {
			System.out.println(e.getMessage());
		}
	}
}
